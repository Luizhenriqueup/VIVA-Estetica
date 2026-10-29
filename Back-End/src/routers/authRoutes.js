import express from 'express';
import authController from '../Controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import flagMiddleware from '../middleware/flagMiddleware.js';
import { Flags } from '../domain/flags.js';

const router = express.Router();

router.post('/login', authController.loginAction);
router.post('/register/tempLogin', authMiddleware, flagMiddleware([Flags.ADMIN, Flags.GERENTE]), authController.registerTempLoginAction);
router.post('/register', authMiddleware, authController.registerAction);
router.get('/me', authMiddleware, authController.meAction);
router.get('/users', authMiddleware, flagMiddleware([Flags.ADMIN, Flags.GERENTE]),authController.searchUserAction);
router.post('/logout', authMiddleware, authController.logoutAction);
router.put('/flags', authMiddleware, flagMiddleware(Flags.ADMIN), authController.setFlagsAction);
router.delete('/:id', authMiddleware, authController.deleteAction);

export default router;