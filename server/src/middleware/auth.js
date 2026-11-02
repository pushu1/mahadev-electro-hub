import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session. Please login again.' });
    }
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden. Admin authorization required.' });
  });
}
