import express from "express";
import { body } from "express-validator";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
} from "../controllers/reviewController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
];

const updateReviewValidation = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
];

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.post("/product/:productId", protect, reviewValidation, createReview);
router.put("/:reviewId", protect, updateReviewValidation, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.post("/:reviewId/helpful", protect, toggleHelpfulVote);

export default router;
