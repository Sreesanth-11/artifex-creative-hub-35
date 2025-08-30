import { Request, Response, NextFunction } from "express";
import { User, Product, Order } from "../models";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

// Get user profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    // If no userId provided, get current user's profile
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findById(targetUserId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user's products count
    const productsCount = await Product.countDocuments({
      seller: targetUserId,
      isActive: true,
    });

    // Get user's total likes (sum of likes on all their products)
    const userProducts = await Product.find({
      seller: targetUserId,
      isActive: true,
    });
    const totalLikes = userProducts.reduce(
      (sum, product) => sum + product.likes.length,
      0
    );

    // Calculate profile completion percentage
    const profileFields = [
      user.name,
      user.email,
      user.bio,
      user.location,
      user.website,
      user.avatar,
      user.banner,
    ];
    const completedFields = profileFields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    const profileCompletion = Math.round(
      (completedFields / profileFields.length) * 100
    );

    // Transform user data
    const transformedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      avatar: user.avatar || "",
      banner: user.banner || "",
      isVerified: user.isVerified,
      role: user.role,
      followers: user.followers || [],
      following: user.following || [],
      followerCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      totalSales: user.totalSales || 0,
      rating: user.rating || 0,
      joinDate: user.joinDate || user.createdAt,
      lastActive: user.lastActive,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isActive: user.isActive,
      profileCompletion,
      // Additional stats
      productsCount,
      totalLikes,
    };

    res.status(200).json({
      success: true,
      data: { user: transformedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const userId = req.user?.id;
    const { name, bio, location, website, avatar } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (avatar !== undefined) user.avatar = avatar;

    user.lastActive = new Date();
    await user.save();

    // Return updated user data (excluding password)
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastActive = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Follow/Unfollow user
export const toggleFollow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        error: "You cannot follow yourself",
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isFollowing = currentUser.following?.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following?.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers?.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Follow
      if (!currentUser.following) currentUser.following = [];
      if (!targetUser.followers) targetUser.followers = [];

      currentUser.following.push(targetUserId);
      targetUser.followers.push(userId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !isFollowing,
        followerCount: targetUser.followers?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's products
export const getUserProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      seller: userId,
      isActive: true,
    })
      .populate("seller", "name avatar rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({
      seller: userId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's dashboard stats
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get various stats
    const [
      productsCount,
      totalSales,
      totalOrders,
      totalViews,
      totalDownloads,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({ seller: userId, isActive: true }),
      Order.aggregate([
        { $match: { seller: userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Order.countDocuments({ seller: userId, status: "completed" }),
      Product.aggregate([
        { $match: { seller: userId, isActive: true } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Product.aggregate([
        { $match: { seller: userId, isActive: true } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Order.find({ seller: userId, status: "completed" })
        .populate("product", "title images")
        .populate("buyer", "name avatar")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const stats = {
      productsCount,
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        product: {
          title: (order.product as any)?.title || "Unknown",
          image:
            (order.product as any)?.images?.[0] || "/api/placeholder/100/100",
        },
        buyer: {
          name: (order.buyer as any)?.name || "Unknown",
          avatar: (order.buyer as any)?.avatar || "/api/placeholder/40/40",
        },
        amount: order.amount,
        date: new Date(order.createdAt).toLocaleDateString(),
      })),
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload avatar
export const uploadAvatar = [
  upload.single("avatar"),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Delete old avatar if it exists
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldAvatarPath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update user avatar
      const avatarUrl = `/uploads/${req.file.filename}`;
      user.avatar = avatarUrl;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: { avatarUrl },
      });
    } catch (error) {
      next(error);
    }
  },
];

// Upload banner
export const uploadBanner = [
  upload.single("banner"),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Delete old banner if it exists
      if (user.banner && user.banner.startsWith("/uploads/")) {
        const oldBannerPath = path.join(__dirname, "../../", user.banner);
        if (fs.existsSync(oldBannerPath)) {
          fs.unlinkSync(oldBannerPath);
        }
      }

      // Update user banner
      const bannerUrl = `/uploads/${req.file.filename}`;
      user.banner = bannerUrl;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Banner uploaded successfully",
        data: { bannerUrl },
      });
    } catch (error) {
      next(error);
    }
  },
];
