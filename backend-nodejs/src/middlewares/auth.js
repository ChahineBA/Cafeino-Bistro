const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      req.user = await User.findById(decoded.sub).select('-hashed_password');

      if (!req.user) {
        return res.status(401).json({ detail: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ detail: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ detail: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ detail: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
