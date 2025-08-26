import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  toggleLike,
} from '../controllers/productController';
import { protect, optionalAuth } from '../middleware/auth';
import {
  createProductValidation,
  updateProductValidation,
} from '../utils/validators';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);
router.get('/seller/:sellerId', getSellerProducts);

// Protected routes
router.post('/', protect, createProductValidation, createProduct);
router.put('/:id', protect, updateProductValidation, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/like', protect, toggleLike);
router.get('/my/products', protect, getSellerProducts);

export default router;
