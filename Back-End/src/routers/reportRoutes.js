import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

router.get('/', reportController.getAllAction);
router.get('/:id', reportController.getByIdAction);
router.post('/', reportController.createAction);
router.put('/:id', reportController.updateAction);
router.delete('/:id', reportController.deleteAction);

export default router;