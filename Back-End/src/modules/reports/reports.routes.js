const { Router } = require('express');
const controller = require('./reports.controller');
const { requireFlags, requireAnyFlag } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/questions', requireFlags(FLAGS.REPORT_CREATE), controller.questions);
router.post('/', requireFlags(FLAGS.REPORT_CREATE), controller.create);
router.get('/', requireAnyFlag(FLAGS.REPORT_VIEW_OWN, FLAGS.REPORT_VIEW_ALL), controller.list);
router.get('/export', requireFlags(FLAGS.REPORT_EXPORT), controller.exportAll);
router.get('/:id', requireAnyFlag(FLAGS.REPORT_VIEW_OWN, FLAGS.REPORT_VIEW_ALL), controller.getById);
router.delete('/:id', requireFlags(FLAGS.REPORT_DELETE), controller.remove);

module.exports = router;
