import express from 'express';
import { getDashboardStats , getNextSession , getRecentActivities  , getActivityChartData , getUnreadNotificationCount} from '../controllers/DashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/session', getNextSession );
router.get('/activities' , getRecentActivities);
router.get('/activity-chart', getActivityChartData);
router.get('/unread-count', getUnreadNotificationCount);


export default router;
