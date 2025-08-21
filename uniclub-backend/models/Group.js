const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  category: {
    type: String,
    required: true,
    enum: ['Machine Learning', 'AI Ethics', 'Computer Vision', 'Natural Language Processing', 'Robotics', 'Data Science', 'Research', 'General']
  },
  
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  
  // Group administrators
  adminIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Group members
  memberIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Cached member count for performance
  memberCount: {
    type: Number,
    default: 0
  },
  
  // Optional cover image
  coverImage: {
    type: String,
    default: null
  },
  
  // Group creation info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Group status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  // Group tags for discovery
  tags: [String],
  
  // Group settings
  settings: {
    allowMemberInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    maxMembers: { type: Number, default: null }
  }
}, {
  timestamps: true
});

// Index for efficient queries
groupSchema.index({ name: 1 });
groupSchema.index({ category: 1 });
groupSchema.index({ privacy: 1 });
groupSchema.index({ status: 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for stats
groupSchema.virtual('stats').get(function() {
  return {
    memberCount: this.memberCount,
    adminCount: this.adminIds.length,
    isActive: this.status === 'active'
  };
});

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);