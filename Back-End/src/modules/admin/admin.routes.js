const { Router } = require('express');
const controller = require('./admin.controller');
const { requireFlags } = require('../../middlewares/permission.middleware');
const { FLAGS } = require('../../constants/flags');

const router = Router();

router.get('/users', requireFlags(FLAGS.ADMIN_USER_VIEW), controller.listUsers);
router.get('/roles', requireFlags(FLAGS.ADMIN_USER_CREATE), controller.roles);

// gerar login de funcionario (gerente) / funcionario ou gerente (admin)
router.post('/users', requireFlags(FLAGS.ADMIN_USER_CREATE), controller.createUser);

router.patch('/users/:id/promote', requireFlags(FLAGS.ADMIN_USER_PROMOTE), controller.promote);
router.patch('/users/:id/demote',  requireFlags(FLAGS.ADMIN_USER_PROMOTE), controller.demote);
router.patch('/users/:id/flags',   requireFlags(FLAGS.ADMIN_FLAGS_EDIT),   controller.setFlags);
router.patch('/users/:id/status',  requireFlags(FLAGS.ADMIN_USER_DISABLE), controller.setDisabled);
router.post('/users/:id/reset',    requireFlags(FLAGS.ADMIN_USER_CREATE),  controller.reset);

module.exports = router;
