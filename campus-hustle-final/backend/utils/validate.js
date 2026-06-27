// backend/utils/validate.js
'use strict';

/** Returns true if email looks like an .edu address. */
const isEduEmail = (email) =>
  typeof email === 'string' && /\.edu$/i.test(email.trim());

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

module.exports = { isEduEmail, requireFields, stripWhitespace };
