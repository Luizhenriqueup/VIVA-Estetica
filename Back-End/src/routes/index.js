const { Router } = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const panelRoutes = require('../modules/panel/panel.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/painel', panelRoutes);

module.exports = router;
