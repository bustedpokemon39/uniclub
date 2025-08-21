const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  type: {
    type: String,
    enum: ['Document', 'Tutorial', 'Tool', 'Video'],
    required: true
  },
  
  category: {
    type: String,
    enum: ['Documents', 'Tutorials', 'Tools', 'Videos'],
    required: true
  },
  
  // File information
  fileSize: {
    type: String
  },
  
  fileUrl: {
    type: String
  },
  
  thumbnailUrl: {
    type: String
  },
  
  // Author/uploader
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Approval system
  isApproved: {
    type: Boolean,
    default: false
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  // Engagement tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  comments: {
    type: Number,
    default: 0
  },
  
  saves: {
    type: Number,
    default: 0
  },
  
  shares: {
    type: Number,
    default: 0
  },
  
  // Tags for better searchability
  tags: [{
    type: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  
  // Featured content
  isFeatured: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes
resourceSchema.index({ type: 1, category: 1 });
resourceSchema.index({ isApproved: 1, status: 1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ tags: 1 });

module.exports = mongoose.model('Resource', resourceSchema); 