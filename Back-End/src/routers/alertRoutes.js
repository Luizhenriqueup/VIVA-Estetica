import express from 'express';
import alertController from '../controllers/alertController.js';

const router = express.Router();

router.get('/', alertController.getAllAction);
router.get('/:id', alertController.getByIdAction);
router.post('/', alertController.createAction);
router.put('/:id', alertController.updateAction);
router.delete('/:id', alertController.deleteAction);

export default router;