const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const authenticateToken = (req, res, next) => {
  // Allow OPTIONS requests to pass through without authentication (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  console.log('🔐 AUTH MIDDLEWARE DEBUG:', {
    method: req.method,
    url: req.url,
    authHeader: req.headers['authorization'],
    hasAuthHeader: !!req.headers['authorization']
  });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Handle simple debug token for development - use email-based lookup
    if (token === 'debug-token-for-ashwin-thomas') {
      req.user = {
        userId: '683b6a7623a3da40933f7e24',
        email: 'ashwin.thomas@utdallas.edu',
        debug: true  // Keep debug flag for logging and auto-creation
      };
      console.log('🔧 Debug token accepted for Ashwin Thomas (email-based lookup)');
      return next();
    }
    
    // Handle regular JWT tokens
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Token validation failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken; 