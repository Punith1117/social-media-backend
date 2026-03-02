const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const commentRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Limit each IP to 5 comments per post per window
  message: {
    error: 'Too many comments on this post. Please wait before commenting again.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Create unique key combining IP address and post ID
    const ip = ipKeyGenerator(req);
    const postId = req.params.postId;
    return `comment:${ip}:${postId}`;
  }
});

module.exports = commentRateLimit;
