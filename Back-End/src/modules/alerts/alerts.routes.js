const { Router } = require('express');
const controller = require('./alerts.controller');
const { requireFlags } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/', requireFlags(FLAGS.ALERT_VIEW), controller.list);
router.post('/', requireFlags(FLAGS.ALERT_CREATE), controller.create);
router.get('/:id', requireFlags(FLAGS.ALERT_VIEW), controller.getById);
router.patch('/:id/ack', requireFlags(FLAGS.ALERT_ACK), controller.acknowledge);
router.patch('/:id/resolve', requireFlags(FLAGS.ALERT_RESOLVE), controller.resolve);

module.exports = router;
