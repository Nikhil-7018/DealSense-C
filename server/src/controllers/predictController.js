import * as productModel from '../models/productModel.js';
import * as priceModel from '../models/priceModel.js';
import * as predictionModel from '../models/predictionModel.js';
import { runPrediction } from '../services/predictionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const predictForProduct = asyncHandler(async (req, res) => {
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

  const forecastDays = Math.min(
    30,
    Math.max(1, Number(req.query.days) || 7),
  );

  const history = await priceModel.getPriceHistoryByProduct(productId);
  const rawForModel = history.map((r) => ({
    price: r.price,
    recorded_at: r.recorded_at,
  }));

  const result = runPrediction(rawForModel, forecastDays);

  const recommendation = result.recommendation === 'Buy Now' ? 'Buy Now' : 'Wait';

  await predictionModel.savePrediction({
    productId,
    predictedPrice: result.predictedPrice,
    recommendation,
    trend: result.trend,
    slopePerDay: Number.isFinite(result.slope) ? result.slope : null,
    forecastDays,
    method: result.method,
  });

  res.json({
    success: true,
    product: { id: product.id, name: product.name },
    forecastDays,
    predictedPrice: result.predictedPrice,
    recommendation,
    trend: result.trend,
    rationale: result.rationale,
    slopePerDay: result.slope,
    lastObservedMin: result.lastObservedMin,
    method: result.method,
    regression: {
      intercept: result.intercept,
      pointsSample: result.points.slice(-5),
    },
  });
});
