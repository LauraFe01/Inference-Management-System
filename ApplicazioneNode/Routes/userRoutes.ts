import express from 'express';
import { authMiddleware, isAdminMiddleware} from '../Token/middleware';
import { userController } from '../Controller/userController';

const router = express.Router();

router.post('/login', userController.login);
router.get('/remainingTokens', authMiddleware, userController.getRemainingTokens);
router.post('/refillTokens', authMiddleware, isAdminMiddleware, userController.refillTokens);

export default router;
