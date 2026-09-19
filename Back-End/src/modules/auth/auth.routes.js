const { Router } = require('express');
const controller = require('./auth.controller');
const { requireAuth, requireSetupComplete } = require('../../middlewares/auth.middleware');

const router = Router();

// publico
router.post('/login', controller.login);

// token de setup (login temporario) ja serve aqui
router.post('/setup-credentials', requireAuth, controller.setupCredentials);

// exigem conta ja configurada
router.get('/me', requireAuth, requireSetupComplete, controller.me);
router.post('/change-password', requireAuth, requireSetupComplete, controller.changePassword);
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
