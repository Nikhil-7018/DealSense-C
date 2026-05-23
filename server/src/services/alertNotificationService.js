import * as notificationModel from '../models/notificationModel.js';
import * as wishlistModel from '../models/wishlistModel.js';

export async function checkProductAlerts(productId, price) {
  const alerts = await wishlistModel.getActiveAlertsForProduct(productId, price);
  if (!alerts.length) {
    return;
  }

  const triggeredPrice = Number(price);

  for (const alert of alerts) {
    const message = `Price dropped to ₹${triggeredPrice.toLocaleString('en-IN')} (target ₹${Number(alert.alert_target_price).toLocaleString('en-IN')})`;
    const existing = await notificationModel.findNotificationByUniqueKey(
      alert.user_id,
      productId,
      message,
    );
    if (existing) {
      continue;
    }

    await notificationModel.createNotification(
      alert.user_id,
      productId,
      message,
      triggeredPrice,
      Number(alert.alert_target_price),
    );
  }
}
