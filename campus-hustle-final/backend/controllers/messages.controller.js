// backend/controllers/messages.controller.js
'use strict';

const db = require('../config/db');
const { AppError, asyncHandler } = require('../utils/errors');
const { requireFields } = require('../utils/validate');

// ─── Send a message ──────────────────────────────────────────────────────────

const send = asyncHandler(async (req, res) => {
  const { receiverId, listingId, content } = req.body;

  const missing = requireFields(req.body, ['receiverId', 'listingId', 'content']);
  if (missing) throw new AppError(missing, 400);

  if (req.user.id === parseInt(receiverId, 10)) {
    throw new AppError('You cannot send a message to yourself.', 400);
  }

  const result = await db.query(
    `INSERT INTO messages (sender_id, receiver_id, listing_id, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.user.id, receiverId, listingId, content.trim()]
  );

  res.status(201).json({ success: true, message: result.rows[0] });
});

// ─── Get conversation thread ─────────────────────────────────────────────────

const getThread = asyncHandler(async (req, res) => {
  const { otherUserId, listingId } = req.params;
  const me = req.user.id;

  const result = await db.query(
    `SELECT m.*, u.name AS sender_name
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.listing_id = $1
       AND (
         (m.sender_id = $2 AND m.receiver_id = $3) OR
         (m.sender_id = $3 AND m.receiver_id = $2)
       )
     ORDER BY m.created_at ASC`,
    [listingId, me, otherUserId]
  );

  res.status(200).json({ success: true, messages: result.rows });
});

// ─── Get inbox (all conversations for a user) ────────────────────────────────

const getInbox = asyncHandler(async (req, res) => {
  const me = req.user.id;

  // Return the latest message per conversation (listing + other party)
  const result = await db.query(
    `SELECT DISTINCT ON (m.listing_id, other_user.id)
            m.id, m.content, m.created_at, m.listing_id,
            l.title AS listing_title,
            other_user.id   AS other_user_id,
            other_user.name AS other_user_name
     FROM messages m
     JOIN listings l ON m.listing_id = l.id
     JOIN users other_user
       ON other_user.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.listing_id, other_user.id, m.created_at DESC`,
    [me]
  );

  res.status(200).json({ success: true, conversations: result.rows });
});

module.exports = { send, getThread, getInbox };
