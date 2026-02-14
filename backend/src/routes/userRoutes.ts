import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginUser, logoutUser, signupUser, updateUserActivity } from '../controllers/user.controllers.js';
import { checkCredentials, verifyUser } from '../middlewares/user.middleware.js';

const router = Router();

router.post('/signup', checkCredentials, asyncHandler(signupUser));
router.post('/login', checkCredentials, asyncHandler(loginUser));
router.post('/logout', verifyUser, asyncHandler(logoutUser));
router.post('/activity', verifyUser, asyncHandler(updateUserActivity));

export default router;