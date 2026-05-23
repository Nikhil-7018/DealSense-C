import * as productModel from '../models/productModel.js';
import * as priceModel from '../models/priceModel.js';
import { pivotPriceHistory } from '../services/priceChartService.js';
import { fetchPriceFromUrl } from '../services/priceScraperService.js';
import { checkProductAlerts } from '../services/alertNotificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPricesForProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('Invalid productId');
  }

  const product = await productModel.getProductById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const [historyRows, latestRows] = await Promise.all([
    priceModel.getPriceHistoryByProduct(productId),
    priceModel.getLatestPricesByProduct(productId),
  ]);

  const lowest = latestRows.length ? Math.min(...latestRows.map((r) => Number(r.price))) : null;

  const currentPrices = latestRows.map((row) => ({
    storeId: row.store_id,
    storeName: row.store_name,
    storeSlug: row.store_slug,
    price: Number(row.price),
    recordedAt: row.recorded_at,
    isLowest: lowest !== null && Number(row.price) === lowest,
  }));

  const { chartData, storeNames } = pivotPriceHistory(historyRows);

  res.json({
    success: true,
    product,
    currentPrices,
    historyRaw: historyRows.map((r) => ({
      storeName: r.store_name,
      price: Number(r.price),
      recordedAt: r.recorded_at,
    })),
    chartData,
    chartStoreKeys: storeNames,
  });
});

export const fetchRealtimePrice = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    res.status(400);
    throw new Error('Invalid productId');
  }

  const product = await productModel.getProductById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (!product.url) {
    res.status(400);
    throw new Error('No product URL configured for this product');
  }

  const scrapedPrice = await fetchPriceFromUrl(product.url);
  await priceModel.insertFetchedPrice(productId, scrapedPrice);
  await checkProductAlerts(productId, scrapedPrice);
  const latest = await priceModel.getLatestFetchedPrice(productId);

  res.json({
    success: true,
    productId,
    productName: product.name,
    url: product.url,
    latestPrice: latest
      ? {
          productId: latest.product_id,
          price: Number(latest.price),
          date: latest.date,
          storeId: latest.store_id,
          storeName: latest.store_name,
          storeSlug: latest.store_slug,
        }
      : null,
  });
});
