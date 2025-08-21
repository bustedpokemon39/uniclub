const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authenticateToken = require('../middleware/auth');

// GET /api/groups - Get all public groups
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search 
    } = req.query;
    
    let query = { status: 'active', privacy: 'public' };
    
    // Apply filters
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const groups = await Group.find(query)
      .populate('createdBy', 'name uniqueId')
      .populate('adminIds', 'name uniqueId')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Group.countDocuments(query);
    
    res.json({
      success: true,
      groups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + groups.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

// GET /api/groups/:id - Get specific group details
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name uniqueId profile.avatar')
      .populate('adminIds', 'name uniqueId profile.avatar')
      .populate('memberIds', 'name uniqueId profile.avatar');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group', details: error.message });
  }
});

// POST /api/groups/:id/join - Join a group
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user is already a member
    if (group.memberIds.includes(userId)) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }
    
    // Check if group is at capacity
    if (group.settings.maxMembers && group.memberCount >= group.settings.maxMembers) {
      return res.status(400).json({ error: 'Group is at maximum capacity' });
    }
    
    // Add user to group
    group.memberIds.push(userId);
    group.memberCount = group.memberIds.length;
    await group.save();
    
    res.json({
      success: true,
      message: 'Successfully joined group',
      group: {
        _id: group._id,
        name: group.name,
        memberCount: group.memberCount
      }
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group', details: error.message });
  }
});

// POST /api/groups/:id/leave - Leave a group
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.memberIds.includes(userId)) {
      return res.status(400).json({ error: 'Not a member of this group' });
    }
    
    // Remove user from group
    group.memberIds = group.memberIds.filter(id => !id.equals(userId));
    group.memberCount = group.memberIds.length;
    await group.save();
    
    res.json({
      success: true,
      message: 'Successfully left group',
      group: {
        _id: group._id,
        name: group.name,
        memberCount: group.memberCount
      }
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group', details: error.message });
  }
});

// GET /api/groups/stats/engagement - Get overall groups engagement stats
router.get('/stats/engagement', async (req, res) => {
  try {
    const totalGroups = await Group.countDocuments({ status: 'active' });
    const totalMembers = await Group.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalMembers: { $sum: '$memberCount' } } }
    ]);
    
    const avgMembersPerGroup = totalGroups > 0 ? 
      Math.round((totalMembers[0]?.totalMembers || 0) / totalGroups) : 0;
    
    res.json({
      success: true,
      stats: {
        totalGroups,
        totalMembers: totalMembers[0]?.totalMembers || 0,
        avgMembersPerGroup,
        activeGroups: totalGroups
      }
    });
  } catch (error) {
    console.error('Error fetching group stats:', error);
    res.status(500).json({ error: 'Failed to fetch group stats', details: error.message });
  }
});

module.exports = router;