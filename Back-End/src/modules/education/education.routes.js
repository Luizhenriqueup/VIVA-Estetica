const { Router } = require('express');
const controller = require('./education.controller');
const { requireFlags } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/', requireFlags(FLAGS.EDU_VIEW), controller.list);
router.get('/:id', requireFlags(FLAGS.EDU_VIEW), controller.getById);
router.post('/:id/progress', requireFlags(FLAGS.EDU_VIEW), controller.progress);
router.post('/', requireFlags(FLAGS.EDU_MANAGE), controller.upsert);

module.exports = router;
