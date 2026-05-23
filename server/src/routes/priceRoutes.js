import { Router } from 'express';
import * as priceController from '../controllers/priceController.js';

const router = Router();

router.get('/:productId', priceController.getPricesForProduct);

export default router;
