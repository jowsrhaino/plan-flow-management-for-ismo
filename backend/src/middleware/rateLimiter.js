const rateLimit = require('express-rate-limit');

// Authentication endpoints-க்கு (Login/Register) மட்டுமான Rate Limiter
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 நிமிடங்கள்
  max: 20, // 15 நிமிடங்களில் ஒரு IP-லிருந்து அதிகபட்சம் 20 முறையே முயற்சிக்கலாம்
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

module.exports = { authRateLimiter };