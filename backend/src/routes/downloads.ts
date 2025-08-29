import express from "express";
import {
  getUserDownloads,
  recordDownload,
  getProductDownloadStats,
  getUserDownloadStats,
  downloadFile,
} from "../controllers/downloadController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All download routes require authentication
router.use(protect);

// Get user's download history
router.get("/", getUserDownloads);

// Get user's download statistics
router.get("/stats", getUserDownloadStats);

// Record a download
router.post("/:productId", recordDownload);

// Get download statistics for a specific product (for sellers)
router.get("/product/:productId/stats", getProductDownloadStats);

// Download a file by order ID
router.get("/file/:orderId", downloadFile);

export default router;
