// backend/utils/validate.js
'use strict';

/** Returns true if email has a basic valid shape. */
const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const normalizeAdmissionNumber = (admissionNumber) =>
  String(admissionNumber || '').trim();

const isValidAdmissionNumber = (admissionNumber) =>
  /^\d{6,8}$/.test(normalizeAdmissionNumber(admissionNumber));

/** Ensure required string fields are present and non-empty. */
const requireFields = (body, fields) => {
  for (const field of fields) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `Field '${field}' is required.`;
    }
  }
  return null; // null = valid
};

/** Strip all whitespace from a string (used for OTP comparison). */
const stripWhitespace = (str) => String(str).replace(/\s/g, '');

module.exports = {
  isValidAdmissionNumber,
  isValidEmail,
  normalizeAdmissionNumber,
  requireFields,
  stripWhitespace,
};
