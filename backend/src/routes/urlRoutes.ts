import { Router } from 'express';
import { addURL, getAllLinks, removeURL, useShortURL } from '../controllers/url.controllers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyUser } from '../middlewares/user.middleware.js';

const router = Router();

router.get('/goto/:shortCode', asyncHandler(useShortURL));

router.get('/getAll', verifyUser, asyncHandler(getAllLinks));
router.post('/new', verifyUser, asyncHandler(addURL));
router.delete('/remove', verifyUser, asyncHandler(removeURL));

export default router;