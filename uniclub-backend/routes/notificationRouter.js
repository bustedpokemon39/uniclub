const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/auth');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('actor', 'name profile.avatar uniqueId')
      .populate('comment', 'content')
      .populate('article', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments({ recipient: req.user.userId });
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasMore: parseInt(page) * parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipient: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { 
        $set: { 
          read: true,
          readAt: new Date()
        }
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.userId,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router; 