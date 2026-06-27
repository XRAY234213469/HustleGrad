// backend/middleware/auth.middleware.js
'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Protects routes by verifying the JWT in the Authorization header.
 * Attaches `req.user = { id, email, admissionNumber, is_admin }` on success.
 */
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    // Normalise to a single `id` field — the original code had both `id` and `userId`
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      admissionNumber: decoded.admissionNumber,
      is_admin: Boolean(decoded.is_admin),
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired or token invalid.' });
  }
};
