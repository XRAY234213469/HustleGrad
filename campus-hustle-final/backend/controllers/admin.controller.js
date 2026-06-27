// backend/controllers/admin.controller.js
'use strict';

const db = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errors');

// ─── Guard: only allow admin users ──────────────────────────────────────────

const requireAdmin = (req, _res, next) => {
  if (!req.user?.is_admin) {
    return next(new AppError('Forbidden: admin access required.', 403));
  }
  next();
};

// ─── Platform-wide stats ─────────────────────────────────────────────────────

const getStats = asyncHandler(async (req, res) => {
  const [usersRes, listingsRes, bookingsRes] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM users'),
    db.query('SELECT COUNT(*)::int AS count FROM listings'),
    db.query(`SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'completed'`),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers:            usersRes.rows[0].count,
      totalListings:         listingsRes.rows[0].count,
      completedTransactions: bookingsRes.rows[0].count,
    },
  });
});

// ─── All users ───────────────────────────────────────────────────────────────

const getUsers = asyncHandler(async (_req, res) => {
  const result = await db.query(
    'SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC'
  );
  res.status(200).json({ success: true, users: result.rows });
});

// ─── All listings ────────────────────────────────────────────────────────────

const getListings = asyncHandler(async (_req, res) => {
  const result = await db.query(
    `SELECT l.id, l.title, l.price, l.created_at,
            u.name AS seller_name, c.name AS category_name
     FROM listings l
     JOIN users u      ON l.seller_id   = u.id
     JOIN categories c ON l.category_id = c.id
     ORDER BY l.created_at DESC`
  );
  res.status(200).json({ success: true, listings: result.rows });
});

// ─── Delete a listing ────────────────────────────────────────────────────────

const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await db.query('DELETE FROM listings WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) throw new AppError('Listing not found.', 404);

  res.status(200).json({ success: true, message: 'Listing removed.' });
});

module.exports = { requireAdmin, getStats, getUsers, getListings, deleteListing };
