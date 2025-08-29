import { Request, Response } from "express";
import Download from "../models/Download";
import Product from "../models/Product";
import Order from "../models/Order";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

// Get user's download history
export const getUserDownloads = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const downloads = await Download.find({ user: userId })
      .populate({
        path: "product",
        select: "title description price category images seller createdAt",
        populate: {
          path: "seller",
          select: "name avatar",
        },
      })
      .sort({ downloadDate: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit);

    const totalDownloads = await Download.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        downloads,
        pagination: {
          page,
          limit,
          total: totalDownloads,
          pages: Math.ceil(totalDownloads / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user downloads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch downloads",
    });
  }
};

// Record a download
export const recordDownload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Record the download
    const download = new Download({
      user: userId,
      product: productId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await download.save();

    // Increment product download count
    await Product.findByIdAndUpdate(productId, {
      $inc: { downloads: 1 },
    });

    res.status(201).json({
      success: true,
      data: { download },
      message: "Download recorded successfully",
    });
  } catch (error) {
    console.error("❌ Error recording download:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record download",
    });
  }
};

// Get download statistics for a product (for sellers)
export const getProductDownloadStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    // Verify user owns the product
    const product = await Product.findOne({
      _id: productId,
      seller: userId,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found or access denied",
      });
      return;
    }

    // Get download statistics
    const totalDownloads = await Download.countDocuments({
      product: productId,
    });

    const downloadsThisMonth = await Download.countDocuments({
      product: productId,
      downloadDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const downloadsThisWeek = await Download.countDocuments({
      product: productId,
      downloadDate: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Get recent downloads with user info
    const recentDownloads = await Download.find({ product: productId })
      .populate("user", "name email avatar")
      .sort({ downloadDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalDownloads,
        downloadsThisMonth,
        downloadsThisWeek,
        recentDownloads,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching download stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch download statistics",
    });
  }
};

// Get user's download statistics
export const getUserDownloadStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const totalDownloads = await Download.countDocuments({ user: userId });

    const downloadsThisMonth = await Download.countDocuments({
      user: userId,
      downloadDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // Get downloads by category
    const downloadsByCategory = await Download.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalDownloads,
        downloadsThisMonth,
        downloadsByCategory,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user download stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch download statistics",
    });
  }
};

// Download a file
export const downloadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    // Find the order and verify ownership
    const order = await Order.findOne({
      _id: orderId,
      buyer: userId,
    }).populate("product");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
      return;
    }

    // Check if user can download
    if (order.status !== "completed") {
      res.status(403).json({
        success: false,
        message: "Order must be completed to download",
      });
      return;
    }

    if (order.downloadCount >= order.maxDownloads) {
      res.status(403).json({
        success: false,
        message: "Maximum downloads reached",
      });
      return;
    }

    if (order.expiresAt && new Date() > order.expiresAt) {
      res.status(403).json({
        success: false,
        message: "Download has expired",
      });
      return;
    }

    const product = order.product as any;

    // For now, we'll create a zip file with product information
    // In a real app, you would serve the actual product files
    const downloadContent = {
      productId: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      downloadDate: new Date().toISOString(),
      orderInfo: {
        orderId: order._id,
        purchaseDate: order.createdAt,
        downloadNumber: order.downloadCount + 1,
      },
      // In a real app, this would include links to actual files
      files: product.images || [],
      license: "Standard License - For personal and commercial use",
    };

    // Record the download
    const download = new Download({
      user: userId,
      product: product._id,
      order: orderId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await download.save();

    // Increment download count
    await Order.findByIdAndUpdate(orderId, {
      $inc: { downloadCount: 1 },
    });

    // Set headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${product.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_download.json"`
    );

    res.json(downloadContent);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
};
