import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Owner from '../models/Owner.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'park_conscious_secret_key_2026_safe');

      // Try to find in User or Owner
      let account = await User.findById(decoded.id).select('-password');
      if (!account) {
        account = await Owner.findById(decoded.id).select('-password');
      }

      if (!account) {
        return res.status(401).json({ message: 'Not authorized, account not found' });
      }

      req.user = account;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
