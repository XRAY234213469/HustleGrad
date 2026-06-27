// backend/routes/messages.routes.js
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const messages = require('../controllers/messages.controller');

const router = Router();

router.use(authenticate);

router.post('/',                                        messages.send);
router.get('/inbox',                                    messages.getInbox);
router.get('/thread/:otherUserId/:listingId',           messages.getThread);

module.exports = router;
