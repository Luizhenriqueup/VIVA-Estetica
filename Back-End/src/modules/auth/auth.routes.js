const { Router } = require('express');
const controller = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = Router();

router.post('/login', controller.login);
router.get('/me', requireAuth, controller.me);

module.exports = router;
