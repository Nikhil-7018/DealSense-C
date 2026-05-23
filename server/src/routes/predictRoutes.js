import { Router } from 'express';
import * as predictController from '../controllers/predictController.js';

const router = Router();

router.get('/:productId', predictController.predictForProduct);

export default router;
