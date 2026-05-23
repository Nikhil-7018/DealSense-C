import * as productModel from '../models/productModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const searchProducts = asyncHandler(async (req, res) => {
  const q = req.query.q;
  const products = await productModel.searchProducts(typeof q === 'string' ? q : '');
  res.json({ success: true, query: q || '', count: products.length, products });
});
