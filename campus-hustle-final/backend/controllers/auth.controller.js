// backend/controllers/auth.controller.js
'use strict';

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
const env    = require('../config/env');
const emailService  = require('../services/email.service');
const { AppError, asyncHandler } = require('../utils/errors');
const {
  isValidAdmissionNumber,
  isValidEmail,
  normalizeAdmissionNumber,
  requireFields,
  stripWhitespace,
} = require('../utils/validate');

// ─── Register ────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const { name, admissionNumber, email, password, phoneNumber } = req.body;

  const missing = requireFields(req.body, ['name', 'admissionNumber', 'email', 'password']);
  if (missing) throw new AppError(missing, 400);

  if (!isValidEmail(email)) {
    throw new AppError('Enter a valid personal or Strathmore email address.', 400);
  }

  const normalizedAdmissionNumber = normalizeAdmissionNumber(admissionNumber);
  if (!isValidAdmissionNumber(normalizedAdmissionNumber)) {
    throw new AppError('Admission number must be a 6 to 8 digit number issued by the school.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingAdmission = await db.query('SELECT id FROM users WHERE admission_number = $1', [normalizedAdmissionNumber]);
  if (existingAdmission.rows.length > 0) {
    throw new AppError('An account with this admission number already exists.', 409);
  }

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, admission_number, email, phone_number, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, admission_number, email, phone_number, is_admin, profile_picture_url`,
    [name.trim(), normalizedAdmissionNumber, normalizedEmail, phoneNumber?.trim() || null, passwordHash]
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful. You can now log in.',
    user: result.rows[0],
  });
});

// ─── Login (step 1 of 2FA) ────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const { admissionNumber, password } = req.body;

  const missing = requireFields(req.body, ['admissionNumber', 'password']);
  if (missing) throw new AppError(missing, 400);

  const normalizedAdmissionNumber = normalizeAdmissionNumber(admissionNumber);
  if (!isValidAdmissionNumber(normalizedAdmissionNumber)) {
    throw new AppError('Admission number must be a 6 to 8 digit number issued by the school.', 400);
  }

  const result = await db.query('SELECT * FROM users WHERE admission_number = $1', [normalizedAdmissionNumber]);
  const user   = result.rows[0];

  const invalidCredMsg = 'Invalid admission number or password.';
  if (!user) throw new AppError(invalidCredMsg, 401);

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new AppError(invalidCredMsg, 401);

  const tfaCode  = Math.floor(100_000 + Math.random() * 900_000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.query(
    'UPDATE users SET tfa_code = $1, tfa_expires_at = $2 WHERE id = $3',
    [tfaCode, expiresAt, user.id]
  );

  await emailService.sendTwoFactorCode(user.email, user.name, tfaCode);

  res.status(200).json({
    success: true,
    requires2FA: true,
    userId: user.id,
    message: 'OTP sent to the email linked to this admission number. Valid for 5 minutes.',
  });
});

// ─── Verify 2FA ───────────────────────────────────────────────────────────────

const verify2FA = asyncHandler(async (req, res) => {
  const { userId, tfaCode } = req.body;

  const missing = requireFields(req.body, ['userId', 'tfaCode']);
  if (missing) throw new AppError(missing, 400);

  const result = await db.query(
    'SELECT id, name, admission_number, email, phone_number, is_admin, profile_picture_url, tfa_code, tfa_expires_at FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];
  if (!user) throw new AppError('User not found.', 404);

  const storedCode = stripWhitespace(user.tfa_code ?? '');
  const inputCode  = stripWhitespace(tfaCode);

  if (storedCode !== inputCode) throw new AppError('Invalid 2FA code.', 401);
  if (new Date() > new Date(user.tfa_expires_at)) {
    throw new AppError('2FA code has expired. Please log in again.', 401);
  }

  await db.query('UPDATE users SET tfa_code = NULL, tfa_expires_at = NULL WHERE id = $1', [userId]);

  const token = jwt.sign(
    { userId: user.id, admissionNumber: user.admission_number, email: user.email, is_admin: user.is_admin },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      admission_number: user.admission_number,
      email: user.email,
      phone_number: user.phone_number,
      is_admin: user.is_admin,
      profile_picture_url: user.profile_picture_url,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, name, admission_number, email, phone_number, is_admin, profile_picture_url, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!result.rows[0]) throw new AppError('User session no longer exists.', 401);

  res.status(200).json({ success: true, user: result.rows[0] });
});

// ─── Forgot Password — step 1: send OTP ──────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const { admissionNumber } = req.body;

  const missing = requireFields(req.body, ['admissionNumber']);
  if (missing) throw new AppError(missing, 400);

  const normalizedAdmissionNumber = normalizeAdmissionNumber(admissionNumber);
  if (!isValidAdmissionNumber(normalizedAdmissionNumber)) {
    throw new AppError('Admission number must be a 6 to 8 digit number issued by the school.', 400);
  }

  const result = await db.query(
    'SELECT id, name, email FROM users WHERE admission_number = $1',
    [normalizedAdmissionNumber]
  );
  const user   = result.rows[0];

  // Always return success to prevent email enumeration attacks
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that admission number exists, a reset code has been sent to its linked email.',
    });
  }

  const resetCode = Math.floor(100_000 + Math.random() * 900_000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.query(
    'UPDATE users SET reset_code = $1, reset_code_expires_at = $2 WHERE id = $3',
    [resetCode, expiresAt, user.id]
  );

  await emailService.sendPasswordResetCode(user.email, user.name, resetCode);

  res.status(200).json({
    success: true,
    userId: user.id,
    message: 'If that admission number exists, a reset code has been sent to its linked email.',
  });
});

// ─── Forgot Password — step 2: verify OTP + set new password ─────────────────

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, resetCode, newPassword } = req.body;

  const missing = requireFields(req.body, ['userId', 'resetCode', 'newPassword']);
  if (missing) throw new AppError(missing, 400);

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400);
  }

  const result = await db.query(
    'SELECT id, reset_code, reset_code_expires_at FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];
  if (!user) throw new AppError('User not found.', 404);

  const storedCode = stripWhitespace(user.reset_code ?? '');
  const inputCode  = stripWhitespace(resetCode);

  if (!storedCode || storedCode !== inputCode) {
    throw new AppError('Invalid reset code.', 401);
  }
  if (new Date() > new Date(user.reset_code_expires_at)) {
    throw new AppError('Reset code has expired. Please request a new one.', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.query(
    'UPDATE users SET password_hash = $1, reset_code = NULL, reset_code_expires_at = NULL WHERE id = $2',
    [passwordHash, userId]
  );

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});

module.exports = { register, login, verify2FA, forgotPassword, resetPassword, me };
