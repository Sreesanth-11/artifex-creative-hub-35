import express from "express";
import { body } from "express-validator";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  searchUsers,
  getUserById,
} from "../controllers/chatController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get all conversations for the authenticated user
router.get("/conversations", getConversations);

// Search users for chat
router.get("/search", searchUsers);

// Get user by ID for chat
router.get("/user/:userId", getUserById);

// Get messages for a specific conversation
router.get("/messages/:otherUserId", getMessages);

// Send a new message
router.post(
  "/messages",
  [
    body("receiverId")
      .notEmpty()
      .withMessage("Receiver ID is required")
      .isMongoId()
      .withMessage("Invalid receiver ID"),
    body("content")
      .notEmpty()
      .withMessage("Message content is required")
      .isLength({ max: 1000 })
      .withMessage("Message cannot be more than 1000 characters"),
    body("type")
      .optional()
      .isIn(["text", "image", "file"])
      .withMessage("Invalid message type"),
  ],
  sendMessage
);

// Mark messages as read
router.put("/messages/:otherUserId/read", markAsRead);

export default router;
