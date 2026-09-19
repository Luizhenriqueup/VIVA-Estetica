const { Router } = require('express');
const controller = require('./pops.controller');
const { requireFlags } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/', requireFlags(FLAGS.POP_VIEW), controller.list);
router.get('/:id', requireFlags(FLAGS.POP_VIEW), controller.getById);
router.get('/:id/download', requireFlags(FLAGS.POP_DOWNLOAD), controller.download);
router.post('/', requireFlags(FLAGS.POP_MANAGE), controller.upsert); // TODO: multer p/ upload do PDF

module.exports = router;
