import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyUser } from '../middlewares/user.middleware.js';
import {
    generatePassword,
    convertUnits,
    updateWeatherCity,
    getUserActivityHistory,
    getRecentlyUsedTools,
    getAnalytics,
    updatePreferences,
    getPreferences,
    getLastNote,
    updateLastNote
} from '../controllers/tools.controllers.js';

const router = Router();

router.post('/password/generate', verifyUser, asyncHandler(generatePassword));
router.post('/converter/convert', verifyUser, asyncHandler(convertUnits));
router.post('/weather/city', verifyUser, asyncHandler(updateWeatherCity));
router.get('/activity/history', verifyUser, asyncHandler(getUserActivityHistory));
router.get('/dashboard/recent-tools', verifyUser, asyncHandler(getRecentlyUsedTools));
router.get('/analytics', verifyUser, asyncHandler(getAnalytics));
router.get('/preferences', verifyUser, asyncHandler(getPreferences));
router.put('/preferences', verifyUser, asyncHandler(updatePreferences));
router.get('/note/last', verifyUser, asyncHandler(getLastNote));
router.put('/note/last', verifyUser, asyncHandler(updateLastNote));

export default router;