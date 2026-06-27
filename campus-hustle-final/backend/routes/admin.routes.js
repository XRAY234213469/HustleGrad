// backend/routes/admin.routes.js
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const admin = require('../controllers/admin.controller');

const router = Router();

// Every admin route requires: 1) valid JWT, 2) is_admin flag
router.use(authenticate, admin.requireAdmin);

router.get('/stats',            admin.getStats);
router.get('/users',            admin.getUsers);
router.get('/listings',         admin.getListings);
router.delete('/listings/:id',  admin.deleteListing);

module.exports = router;
