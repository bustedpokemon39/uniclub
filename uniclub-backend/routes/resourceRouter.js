const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const authenticateToken = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/resources - get all resources with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'approved',
      type,
      category,
      search,
      sortBy = 'downloadCount'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build match stage for aggregation
    const matchStage = { status };
    
    // Filter by type
    if (type && type !== 'All') {
      matchStage.type = type;
    }
    
    // Filter by category
    if (category && category !== 'All') {
      matchStage.category = category;
    }
    
    // Search in title and description
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'downloadCount':
        sortOptions = { downloadCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      default:
        sortOptions = { downloadCount: -1 };
    }
    
    const resources = await Resource.find(matchStage)
      .populate('uploadedBy', 'name profile.avatar uniqueId')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Resource.countDocuments(matchStage);
    
    // Get real-time comment counts for all resources
    const resourceIds = resources.map(resource => resource._id);
    const commentCounts = await Comment.aggregate([
      { 
        $match: { 
          contentType: 'resource',
          contentId: { $in: resourceIds }, 
          status: 'active' 
        } 
      },
      { $group: { _id: '$contentId', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(cc => {
      commentCountMap[cc._id.toString()] = cc.count;
    });
    
    // Transform resources to include comment counts
    const transformedResources = resources.map(resource => ({
      ...resource.toObject(),
      commentCount: commentCountMap[resource._id.toString()] || 0,
      discussionCount: commentCountMap[resource._id.toString()] || 0
    }));
    
    res.json({
      success: true,
      resources: transformedResources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
  }
});

// GET /api/resources/:id - get specific resource
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name profile.avatar uniqueId')
      .populate('approvedBy', 'name profile.avatar uniqueId');
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment view count
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource', details: error.message });
  }
});

// POST /api/resources - create new resource (authenticated users only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      uploadedBy: req.user.userId,
      status: 'pending' // All new resources need approval
    };
    
    const resource = new Resource(resourceData);
    await resource.save();
    
    await resource.populate('uploadedBy', 'name profile.avatar uniqueId');
    
    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource', details: error.message });
  }
});

// PUT /api/resources/:id - update resource (author or admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if user is the uploader (for now, we'll allow all authenticated users)
    if (resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the uploader can update this resource' });
    }
    
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name profile.avatar uniqueId');
    
    res.json({
      success: true,
      resource: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource', details: error.message });
  }
});

// POST /api/resources/:id/download - increment download count
router.post('/:id/download', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({
      success: true,
      message: 'Download count updated',
      downloadCount: resource.downloadCount
    });
  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({ error: 'Failed to update download count', details: error.message });
  }
});

// GET /api/resources/stats/summary - get resource statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments({ status: 'approved' });
    const totalDownloads = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    
    const typeStats = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalResources,
        totalDownloads: totalDownloads[0]?.total || 0,
        byType: typeStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({ error: 'Failed to fetch resource stats', details: error.message });
  }
});

module.exports = router; 