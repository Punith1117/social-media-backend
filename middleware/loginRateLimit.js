const rateLimit = require('express-rate-limit');

const loginRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // Limit each username to 3 login attempts per window
  message: {
    error: 'Too many login attempts. Please try again later.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Create unique key using username from request body
    const username = req.body.username || '';
    return `login:${username.toLowerCase()}`;
  },
  skipSuccessfulRequests: true // Don't count successful login attempts
});

module.exports = loginRateLimit;
