// backend/routes/listings.routes.js
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const listings = require('../controllers/listings.controller');

const router = Router();

// Protected
router.get('/my/dashboard', authenticate, listings.getDashboardMetrics);
router.post('/',            authenticate, listings.create);

// Public
router.get('/top/hustlers', listings.topHustlers);
router.get('/',        listings.search);
router.get('/:id',     listings.getById);

module.exports = router;
