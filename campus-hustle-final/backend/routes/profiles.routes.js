'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const profiles = require('../controllers/profiles.controller');

const router = Router();

router.patch('/me/profile-picture', authenticate, profiles.updateProfilePicture);

module.exports = router;
