const { Router } = require('express');
const controller = require('./panel.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = Router();

router.use(requireAuth);
router.get('/', controller.getPainel);
router.post('/trocar-perfil', controller.trocarPerfil);

module.exports = router;
