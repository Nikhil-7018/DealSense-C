import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

router.use(requireAuth);
router.get('/', notificationController.listNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:notificationId/read', notificationController.markNotificationRead);

export default router;
