const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const payments = require('../controllers/payments.controller');

const router = Router();

// 1. PUBLIC ROUTE: Safaricom calls this, so it CANNOT require auth
router.post('/mpesa/callback', payments.mpesaCallback);

// 2. PROTECTED ROUTES: Users must be logged in to initiate a payment
router.use(authenticate); 
router.post('/mpesa/stk-push', payments.initiateMpesa);

module.exports = router;