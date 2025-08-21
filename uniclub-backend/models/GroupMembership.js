const mongoose = require('mongoose');

/**
 * Group Membership Model - Detailed membership tracking with roles and permissions
 * Separates membership data from the Group model for better performance
 */
const groupMembershipSchema = new mongoose.Schema({
  // References
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Membership status
  status: {
    type: String,
    enum: ['active', 'pending', 'invited', 'banned', 'left'],
    default: 'active'
  },
  
  // Role within the group
  role: {
    type: String,
    enum: ['member', 'moderator', 'admin', 'creator'],
    default: 'member'
  },
  
  // Membership context
  joinedVia: {
    type: String,
    enum: ['invitation', 'request', 'direct-join', 'admin-added'],
    default: 'direct-join'
  },
  
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Permissions within the group
  permissions: {
    canPost: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canInvite: { type: Boolean, default: false },
    canModerate: { type: Boolean, default: false },
    canManageEvents: { type: Boolean, default: false }
  },
  
  // Activity tracking
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // Engagement metrics
  engagement: {
    postsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 }
  },
  
  // Notification preferences for this group
  notifications: {
    newPosts: { type: Boolean, default: true },
    newComments: { type: Boolean, default: false },
    events: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    adminAnnouncements: { type: Boolean, default: true }
  },
  
  // Membership dates
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  leftAt: { type: Date },
  bannedAt: { type: Date },
  
  // Ban details
  banReason: { type: String },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Custom member title/badge in group
  customTitle: {
    type: String,
    maxlength: 50
  },
  
  // Member notes (visible to admins)
  adminNotes: {
    type: String,
    maxlength: 500
  }
  
}, {
  timestamps: true
});

// Compound indexes
groupMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMembershipSchema.index({ groupId: 1, status: 1, role: 1 }); // Group members by status/role
groupMembershipSchema.index({ userId: 1, status: 1 }); // User's group memberships
groupMembershipSchema.index({ groupId: 1, lastActiveAt: -1 }); // Active members
groupMembershipSchema.index({ invitedBy: 1 }); // Who invited whom
groupMembershipSchema.index({ joinedAt: -1 }); // Recent members

// Update group stats when membership changes
groupMembershipSchema.post('save', async function() {
  if (this.isModified('status')) {
    const Group = mongoose.model('Group');
    
    // Recalculate member count
    const memberCount = await mongoose.model('GroupMembership').countDocuments({
      groupId: this.groupId,
      status: 'active'
    });
    
    await Group.findByIdAndUpdate(this.groupId, {
      'stats.memberCount': memberCount
    });
  }
});

module.exports = mongoose.model('GroupMembership', groupMembershipSchema);
