// backend/utils/errors.js
// Centralised HTTP error helpers so route handlers stay thin.
'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // flag to distinguish from programmer errors
  }
}

/** Send a structured error response. */
const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });

/** Wrap an async route handler so unhandled promise rejections go to next(). */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { AppError, sendError, asyncHandler };
