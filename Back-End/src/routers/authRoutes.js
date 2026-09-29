import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.loginAction);
router.post('/register/tempLogin', authController.registerTempLoginAction);
router.post('/register', authController.registerAction);
router.post('/logout', authController.logoutAction);
router.delete('/:id', authController.deleteAction);

export default router;