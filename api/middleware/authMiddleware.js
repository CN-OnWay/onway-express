const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { verifyToken } = require('../controllers/authController');

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Access token not provided' });
  }

  try {
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.uid || !decoded.timestamp) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ message: 'User not found' });
    }

    verifyToken(token, decoded.uid, decoded.timestamp, false);

    req.user = {
      uid: decoded.uid,
      ...userDoc.data()
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};