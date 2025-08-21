const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for API endpoints
 * Prevents abuse and ensures fair usage
 */

// General API rate limit
const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for post creation
const createPostLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 post creations per minute
  message: {
    error: 'Too many posts created, please wait before creating another post.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Comment creation rate limit
const createCommentLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 comments per minute
  message: {
    error: 'Too many comments posted, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Like/interaction rate limit
const interactionLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 interactions per minute
  message: {
    error: 'Too many interactions, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Follow/unfollow rate limit
const followLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 follow actions per minute
  message: {
    error: 'Too many follow/unfollow actions, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limit (more restrictive)
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimit,
  createPostLimit,
  createCommentLimit,
  interactionLimit,
  followLimit,
  authLimit
};
