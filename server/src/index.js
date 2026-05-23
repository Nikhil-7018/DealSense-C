import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import fetchPriceRoutes from './routes/fetchPriceRoutes.js';
import predictRoutes from './routes/predictRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'DealSense AI API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/fetch-price', fetchPriceRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`DealSense API listening on http://localhost:${port}`);
});
