import express from 'express';
import reportController from '../Controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import flagMiddleware from '../middleware/flagMiddleware.js';
import { Flags } from '../domain/flags.js';

const router = express.Router();

router.use(authMiddleware, flagMiddleware(Object.values(Flags)));
router.get('/', reportController.getAllAction);
router.get('/:id', reportController.getByIdAction);
router.post('/', reportController.createAction);
router.patch('/:id', reportController.updateAction);
router.delete('/:id', flagMiddleware([Flags.ADMIN, Flags.GERENTE]),
  reportController.deleteAction,
);

export default router;
