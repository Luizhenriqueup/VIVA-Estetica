import express from 'express';
import alertController from '../Controllers/alertController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import flagMiddleware from '../middleware/flagMiddleware.js';
import { Flags } from '../domain/flags.js';

const router = express.Router();

router.use(authMiddleware, flagMiddleware(Object.values(Flags)));
router.get('/', alertController.getAllAction);
router.get('/:id', alertController.getByIdAction);
router.post('/', flagMiddleware([Flags.ADMIN, Flags.GERENTE]), alertController.createAction);
router.put('/:id', flagMiddleware([Flags.ADMIN, Flags.GERENTE]), alertController.updateAction);
router.delete('/:id', flagMiddleware([Flags.ADMIN, Flags.GERENTE]), alertController.deleteAction);

export default router;