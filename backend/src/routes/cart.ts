import express from "express";
import { body, param } from "express-validator";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Validation middleware
const addToCartValidation = [
  body("productId").isMongoId().withMessage("Valid product ID is required"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const updateCartItemValidation = [
  param("productId").isMongoId().withMessage("Valid product ID is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

const removeFromCartValidation = [
  param("productId").isMongoId().withMessage("Valid product ID is required"),
];

// Routes
router.get("/", getCart);
router.post("/", addToCartValidation, addToCart);
router.put("/:productId", updateCartItemValidation, updateCartItem);
router.delete("/:productId", removeFromCartValidation, removeFromCart);
router.delete("/", clearCart);

export default router;
