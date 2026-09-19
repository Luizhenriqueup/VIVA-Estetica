const { Router } = require('express');
const controller = require('./panel.controller');
const { requireFlags } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/', requireFlags(FLAGS.PANEL_ACCESS), controller.getPanel);
router.get('/roles', requireFlags(FLAGS.PANEL_ACCESS), controller.listRoles);
router.post('/switch-role', requireFlags(FLAGS.PANEL_ACCESS), controller.switchRole);

module.exports = router;
