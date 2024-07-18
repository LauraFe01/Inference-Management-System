import express from 'express';
import { authMiddleware, isAdminMiddleware } from '../middleware';
import { userController } from '../Controller/userController';

const router = express.Router();

/**
 * POST /api/login
 * Route handler for user login.
 * Calls the login function from userController.
 */
router.post('/login', userController.login);

/**
 * GET /api/remainingTokens
 * Route handler for retrieving remaining tokens for the authenticated user.
 * Requires authentication middleware.
 * Calls the getRemainingTokens function from userController.
 */
router.get('/remainingTokens', authMiddleware, userController.getRemainingTokens);

/**
 * POST /api/refillTokens
 * Route handler for refilling tokens (admin operation).
 * Requires authentication middleware and admin authorization.
 * Calls the refillTokens function from userController.
 */
router.post('/refillTokens', authMiddleware, isAdminMiddleware, userController.refillTokens);

export default router;
