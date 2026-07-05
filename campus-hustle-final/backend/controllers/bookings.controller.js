// backend/controllers/bookings.controller.js
'use strict';

const db = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errors');
const { requireFields } = require('../utils/validate');

// ─── Create booking ──────────────────────────────────────────────────────────

const create = asyncHandler(async (req, res) => {
  const { listingId, scheduledDate, deliveryRequired, deliveryAddress, deliveryNotes } = req.body;

  const missing = requireFields(req.body, ['listingId', 'scheduledDate']);
  if (missing) throw new AppError(missing, 400);

  const listingCheck = await db.query('SELECT offers_delivery FROM listings WHERE id = $1', [listingId]);
  if (listingCheck.rows.length === 0) throw new AppError('Listing not found.', 404);
  if (deliveryRequired && !listingCheck.rows[0].offers_delivery) {
    throw new AppError('This vendor has not enabled delivery for this listing.', 400);
  }
  if (deliveryRequired && !deliveryAddress?.trim()) {
    throw new AppError('Delivery address is required when delivery is selected.', 400);
  }

  const result = await db.query(
    `INSERT INTO bookings (buyer_id, listing_id, scheduled_date, delivery_required, delivery_address, delivery_notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
    [
      req.user.id,
      listingId,
      scheduledDate,
      Boolean(deliveryRequired),
      deliveryRequired ? deliveryAddress.trim() : null,
      deliveryNotes?.trim() || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: deliveryRequired
      ? 'Booking request sent with delivery details. Pay with M-PESA to secure the order.'
      : 'Booking request sent. Pay with M-PESA or coordinate pickup with the vendor.',
    booking: result.rows[0],
  });
});

// ─── Vendor notifications ─────────────────────────────────────────────────────

const getVendorNotifications = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT b.id AS booking_id, b.scheduled_date, b.status,
            b.delivery_required, b.delivery_address, b.delivery_notes,
            l.title AS listing_title,
            u.name  AS buyer_name
     FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     JOIN users    u ON b.buyer_id   = u.id
     WHERE l.seller_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );

  res.status(200).json({ success: true, data: result.rows });
});

// ─── Mark booking complete ───────────────────────────────────────────────────

const markComplete = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // Authorisation: only the seller who owns the listing may close the booking
  const ownerCheck = await db.query(
    `SELECT b.id, b.status
     FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     WHERE b.id = $1 AND l.seller_id = $2`,
    [bookingId, req.user.id]
  );

  if (ownerCheck.rows.length === 0) {
    throw new AppError('Forbidden: you are not the provider for this booking.', 403);
  }

  if (ownerCheck.rows[0].status === 'completed') {
    return res.status(200).json({ success: true, message: 'Booking was already completed.' });
  }
  if (ownerCheck.rows[0].status !== 'received') {
    throw new AppError('Buyer must mark the order as received before you can mark it done.', 400);
  }

  await db.query("UPDATE bookings SET status = 'completed' WHERE id = $1", [bookingId]);

  res.status(200).json({ success: true, message: 'Booking marked as completed.' });
});

// ─── Buyer confirms they received the order/service ──────────────────────────

const markReceived = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const result = await db.query(
    `UPDATE bookings
     SET status = 'received'
     WHERE id = $1 AND buyer_id = $2 AND status IN ('pending', 'confirmed')
     RETURNING *`,
    [bookingId, req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Booking not found or cannot be marked received.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Order marked as received. The vendor can now mark it as done.',
    booking: result.rows[0],
  });
});

// ─── Submit review ────────────────────────────────────────────────────────────

const submitReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const missing = requireFields(req.body, ['bookingId', 'rating']);
  if (missing) throw new AppError(missing, 400);

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new AppError('Rating must be an integer between 1 and 5.', 400);
  }

  const bookingCheck = await db.query(
    'SELECT id, buyer_id FROM bookings WHERE id = $1',
    [bookingId]
  );

  if (bookingCheck.rows.length === 0) throw new AppError('Booking not found.', 404);
  if (bookingCheck.rows[0].buyer_id !== req.user.id) {
    throw new AppError('Only the buyer of this booking can submit a review.', 403);
  }

  const result = await db.query(
    `INSERT INTO reviews (booking_id, reviewer_id, rating, comment)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [bookingId, req.user.id, parsedRating, comment || null]
  );

  res.status(201).json({ success: true, review: result.rows[0] });
});

// ─── Get reviews for a booking ────────────────────────────────────────────────

const getReviews = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT r.*, u.name AS reviewer_name
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     WHERE r.booking_id = $1
     ORDER BY r.created_at DESC`,
    [req.params.bookingId]
  );

  res.status(200).json({ success: true, reviews: result.rows });
});

module.exports = { create, getVendorNotifications, markComplete, markReceived, submitReview, getReviews };
