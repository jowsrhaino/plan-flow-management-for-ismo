const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

// பாதுகாக்கப்பட்ட Routes-க்குச் செல்ல Token உள்ளதா எனச் சோதிக்கும் Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Header-ல் Token உள்ளதா எனப் பார்க்கிறோம் (Format: Bearer <token>)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.'
    });
  }

  // Extract only the JWT value from "Bearer <token>".
  // `split` returns an array; passing that array to jwt.verify makes every
  // newly issued token appear invalid during the /auth/me request.
  const token = authHeader.split(' ')[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    
    // லாகின் செய்த பயனரின் தகவல்களை req.user-ல் வைக்கிறோம்
    req.user = decoded; // { id, email, fullName }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired. Please login again.' : 'Invalid token.'
    });
  }
};

module.exports = { authenticateJWT };
