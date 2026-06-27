// backend/routes/auth.routes.js
'use strict';

const { Router } = require('express');
const auth = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

router.post('/register',        auth.register);
router.post('/login',           auth.login);
router.post('/verify-2fa',      auth.verify2FA);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password',  auth.resetPassword);
router.get('/me', authenticate, auth.me);

module.exports = router;
