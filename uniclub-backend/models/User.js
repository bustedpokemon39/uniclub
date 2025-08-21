const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication & Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isEnrolled: { type: Boolean, default: false },
  
  // Social Profile Features
  profile: {
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    interests: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String
    },
    avatar: {
      data: String,
      contentType: String,
      originalName: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' }
    }
  },
  
  // Social Stats
  socialStats: {
    articlesLiked: { type: Number, default: 0 },
    articlesSaved: { type: Number, default: 0 },
    commentsPosted: { type: Number, default: 0 },
    chatInteractions: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
    eventsCreated: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 }
  },
  
  // Privacy & Settings
  settings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'club-members', 'private'],
      default: 'club-members'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    commentNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Account Status
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Admin privileges
  isAdmin: {
    type: Boolean,
    default: false
  }
  
}, { timestamps: true });

// Indexes for performance
userSchema.index({ uniqueId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isEnrolled: 1 });
userSchema.index({ lastActive: -1 });

// Add indexing for avatar queries
userSchema.index({ 'profile.avatar.uploadedAt': 1 });

module.exports = mongoose.model('User', userSchema); 