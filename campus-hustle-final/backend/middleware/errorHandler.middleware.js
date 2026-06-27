// backend/middleware/errorHandler.middleware.js
// Central Express error handler — catches anything passed to next(err).
'use strict';

const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational
      ? err.message
      : env.isDev
        ? err.message
        : 'An unexpected server error occurred.';

  if (!err.isOperational) {
    // Log programmer errors loudly — these need fixing
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({ success: false, message });
};
