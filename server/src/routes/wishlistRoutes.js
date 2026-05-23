import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = Router();

router.use(requireAuth);

router.get('/', wishlistController.listWishlist);
router.get('/alert', wishlistController.getWishlistAlertStatus);
router.patch('/alert', wishlistController.updateWishlistAlert);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove', wishlistController.removeFromWishlist);

export default router;
