// backend/routes/bookings.routes.js
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const bookings = require('../controllers/bookings.controller');

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/',                                bookings.create);
router.get('/vendor/notifications',             bookings.getVendorNotifications);
router.patch('/:bookingId/received',            bookings.markReceived);
router.patch('/:bookingId/complete',            bookings.markComplete);
router.post('/reviews',                         bookings.submitReview);
router.get('/:bookingId/reviews',               bookings.getReviews);

module.exports = router;
