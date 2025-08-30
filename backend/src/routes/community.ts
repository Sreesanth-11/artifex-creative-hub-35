import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  addComment,
  toggleCommentLike,
  getTrendingTopics,
  getFeaturedUsers,
} from "../controllers/communityController";
import { protect, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public routes (with optional auth)
router.get("/", optionalAuth, getPosts);
router.get("/:postId", optionalAuth, getPost);
router.get("/trending/topics", getTrendingTopics);
router.get("/featured/users", getFeaturedUsers);

// Protected routes
router.use(protect);

// Post management
router.post("/", createPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

// Post interactions
router.post("/:postId/like", togglePostLike);
router.post("/:postId/comments", addComment);

// Comment interactions
router.post("/comments/:commentId/like", toggleCommentLike);

export default router;
