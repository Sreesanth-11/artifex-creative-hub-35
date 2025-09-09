import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  confirmOrder,
  getUserOrders,
  getSellerSales,
  getOrder,
} from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Validation middleware
const createOrderValidation = [
  body("productId").isMongoId().withMessage("Valid product ID is required"),
];

const confirmOrderValidation = [
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment intent ID is required"),
];

// Order routes
router.post("/", createOrderValidation, createOrder);
router.post("/confirm", confirmOrderValidation, confirmOrder);
router.get("/", getUserOrders);
router.get("/sales", getSellerSales);
router.get("/:orderId", getOrder);

export default router;
