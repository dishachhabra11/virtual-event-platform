import express from 'express';
import { upload } from '../middlewares/multer.js';
import {
  createPromotion,
  getValidPromotionsForToday,
} from '../controllers/promotionConroller.js';

const router = express.Router();

router.get('/', getValidPromotionsForToday);
router.post('/', upload.single('image'), createPromotion);

export default router;
