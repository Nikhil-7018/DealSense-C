import * as notificationModel from '../models/notificationModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationModel.listNotificationsByUser(req.user.id);
  const unreadCount = notifications.filter((notification) => notification.is_read === 0).length;
  res.json({ success: true, unreadCount, notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.notificationId);
  if (!Number.isInteger(notificationId) || notificationId < 1) {
    res.status(400);
    throw new Error('notificationId is required');
  }
  const updated = await notificationModel.markNotificationRead(req.user.id, notificationId);
  if (!updated) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json({ success: true, notificationId });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationModel.markAllNotificationsRead(req.user.id);
  res.json({ success: true });
});
