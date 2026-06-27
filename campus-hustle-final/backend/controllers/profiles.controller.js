'use strict';

const db = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');
const { saveProfilePicture } = require('../services/profilePicture.service');

const updateProfilePicture = asyncHandler(async (req, res) => {
  const { imageDataUrl } = req.body;
  if (!imageDataUrl) throw new AppError('Choose a profile picture to upload.', 400);

  const publicUrl = await saveProfilePicture({ userId: req.user.id, dataUrl: imageDataUrl });
  const result = await db.query(
    `UPDATE users
     SET profile_picture_url = $1
     WHERE id = $2
     RETURNING id, name, admission_number, email, phone_number, is_admin, profile_picture_url`,
    [publicUrl, req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Profile picture updated.',
    user: result.rows[0],
  });
});

module.exports = { updateProfilePicture };
