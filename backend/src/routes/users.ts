import express from "express";
import { body } from "express-validator";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  toggleFollow,
  getUserProducts,
  getUserStats,
  getUserFollowers,
  getUserFollowing,
  uploadAvatar,
  uploadBanner,
} from "../controllers/userController";
import { protect, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Validation middleware
const updateProfileValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot be more than 500 characters"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location cannot be more than 100 characters"),
  body("website")
    .optional()
    .isURL()
    .withMessage("Please enter a valid website URL"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Public routes
router.get("/:userId", optionalAuth, getUserProfile);
router.get("/:userId/products", getUserProducts);
router.get("/:userId/followers", optionalAuth, getUserFollowers);
router.get("/:userId/following", optionalAuth, getUserFollowing);

// Protected routes
router.get("/", protect, getUserProfile); // Get current user profile
router.put("/", protect, updateProfileValidation, updateUserProfile);
router.put("/password", protect, changePasswordValidation, changePassword);
router.post("/:targetUserId/follow", protect, toggleFollow);
router.get("/dashboard/stats", protect, getUserStats);

// Upload avatar (protected)
router.post("/upload-avatar", protect, uploadAvatar);

// Upload banner (protected)
router.post("/upload-banner", protect, uploadBanner);

export default router;
