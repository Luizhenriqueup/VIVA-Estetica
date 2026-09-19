const { Router } = require('express');
const { requireAuth, requireSetupComplete } = require('../middlewares/auth.middleware');

const authRoutes = require('../modules/auth/auth.routes');
const panelRoutes = require('../modules/panel/panel.routes');
const reportsRoutes = require('../modules/reports/reports.routes');
const alertsRoutes = require('../modules/alerts/alerts.routes');
const popsRoutes = require('../modules/pops/pops.routes');
const educationRoutes = require('../modules/education/education.routes');
const adminRoutes = require('../modules/admin/admin.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', ts: Date.now() } }));

// publico / setup
router.use('/auth', authRoutes);

// tudo abaixo exige login + credenciais definitivas
const protectedRoutes = Router();
protectedRoutes.use(requireAuth, requireSetupComplete);
protectedRoutes.use('/panel', panelRoutes);
protectedRoutes.use('/reports', reportsRoutes);
protectedRoutes.use('/alerts', alertsRoutes);
protectedRoutes.use('/pops', popsRoutes);
protectedRoutes.use('/education', educationRoutes);
protectedRoutes.use('/admin', adminRoutes);

router.use(protectedRoutes);

module.exports = router;
