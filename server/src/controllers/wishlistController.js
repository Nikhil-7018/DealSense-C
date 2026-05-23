import * as productModel from '../models/productModel.js';
import * as wishlistModel from '../models/wishlistModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addToWishlist = asyncHandler(async (req, res) => {
  const productId = Number(req.body?.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('productId is required');
  }

  const product = await productModel.getProductById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await wishlistModel.addWishlistItem(req.user.id, productId);
  res.status(201).json({ success: true, productId });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = Number(req.body?.productId ?? req.query?.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('productId is required');
  }

  const removed = await wishlistModel.removeWishlistItem(req.user.id, productId);
  if (!removed) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }
  res.json({ success: true, productId });
});

export const listWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistModel.listWishlistByUser(req.user.id);
  res.json({ success: true, count: items.length, items });
});

export const getWishlistAlertStatus = asyncHandler(async (req, res) => {
  const productId = Number(req.query?.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('productId is required');
  }

  const alertStatus = await wishlistModel.getWishlistAlertStatus(req.user.id, productId);
  if (!alertStatus) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }

  res.json({
    success: true,
    alertEnabled: Boolean(alertStatus.alert_enabled),
    alertTargetPrice: alertStatus.alert_target_price ? Number(alertStatus.alert_target_price) : null,
  });
});

export const updateWishlistAlert = asyncHandler(async (req, res) => {
  const productId = Number(req.body?.productId);
  const enabled = Boolean(req.body?.enabled);
  const targetPrice = req.body?.targetPrice ?? null;

  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('productId is required');
  }

  if (enabled && (typeof targetPrice !== 'number' || targetPrice <= 0)) {
    res.status(400);
    throw new Error('targetPrice must be a positive number when alert is enabled');
  }

  const updated = await wishlistModel.updateWishlistAlert(
    req.user.id,
    productId,
    enabled,
    enabled ? targetPrice : null,
  );

  if (!updated) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }

  res.json({
    success: true,
    productId,
    alertEnabled: enabled,
    alertTargetPrice: enabled ? Number(targetPrice) : null,
  });
});
