import { Request, Response, NextFunction } from "express";
import { Product, User, Review } from "../models";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice)
        filter.price.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice)
        filter.price.$lte = parseFloat(req.query.maxPrice as string);
    }

    // Sort options
    let sort: any = { createdAt: -1 };
    if (req.query.sort === "price-low") sort = { price: 1 };
    if (req.query.sort === "price-high") sort = { price: -1 };
    if (req.query.sort === "popular") sort = { downloads: -1 };
    if (req.query.sort === "rating") sort = { rating: -1 };

    const products = await Product.find(filter)
      .populate("seller", "name avatar rating")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

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

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Get the product with populated seller information
    const product = await Product.findById(req.params.id)
      .populate(
        "seller",
        "name avatar isVerified totalSales createdAt followers"
      )
      .populate({
        path: "likes",
        select: "name avatar",
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Get reviews for this product
    const reviews = await Review.find({ product: product._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select("title price images rating");

    // Transform files to handle both old and new formats
    const transformedFiles = product.files.map((file: any) => ({
      name: file.name || file.filename || "Unknown File",
      url: file.url,
      size: file.size || "Unknown",
      type: file.type || file.format || "Unknown",
    }));

    // Transform the data to match frontend expectations
    const transformedProduct = {
      _id: product._id,
      id: product._id,
      title: product.title,
      description: product.description,
      longDescription: product.longDescription || product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      rating: product.rating,
      reviewCount: product.reviewCount,
      downloads: product.downloads,
      views: product.views,
      images: product.images,
      category: product.category,
      tags: product.tags,
      likes: product.likes,
      likeCount: product.likes?.length || 0,
      seller: {
        _id: (product.seller as any)?._id,
        name: (product.seller as any)?.name || "Unknown Designer",
        avatar: (product.seller as any)?.avatar || "/api/placeholder/60/60",
        isVerified: (product.seller as any)?.isVerified || false,
        followers: (product.seller as any)?.followers?.length || 0,
        products: (product.seller as any)?.totalSales || 0,
        joinDate: (product.seller as any)?.createdAt
          ? new Date((product.seller as any).createdAt).getFullYear()
          : new Date().getFullYear(),
      },
      designer: {
        name: (product.seller as any)?.name || "Unknown Designer",
        avatar: (product.seller as any)?.avatar || "/api/placeholder/60/60",
        verified: (product.seller as any)?.isVerified || false,
        followers: (product.seller as any)?.followers?.length || 0,
        products: (product.seller as any)?.totalSales || 0,
        joinDate: (product.seller as any)?.createdAt
          ? new Date((product.seller as any).createdAt).getFullYear()
          : new Date().getFullYear(),
      },
      files: transformedFiles,
      license: product.license,
      publishDate: product.publishDate,
      lastUpdate: product.lastUpdate,
    };

    // Transform reviews to match frontend expectations
    const transformedReviews = reviews.map((review) => ({
      id: review._id,
      user: (review.user as any)?.name || "Anonymous",
      avatar: (review.user as any)?.avatar || "/api/placeholder/40/40",
      rating: review.rating,
      date: new Date(review.createdAt).toLocaleDateString(),
      comment: review.comment,
    }));

    // Transform related products
    const transformedRelatedProducts = relatedProducts.map(
      (relatedProduct) => ({
        id: relatedProduct._id,
        title: relatedProduct.title,
        price: `₹${relatedProduct.price}`,
        image: relatedProduct.images[0] || "/api/placeholder/200/150",
        rating: relatedProduct.rating,
      })
    );

    // Increment views if not the seller viewing their own product
    if (
      req.user &&
      product.seller &&
      req.user.id !== (product.seller as any)._id?.toString()
    ) {
      product.views += 1;
      await product.save();
    }

    res.status(200).json({
      success: true,
      data: {
        product: transformedProduct,
        reviews: transformedReviews,
        relatedProducts: transformedRelatedProducts,
      },
    });
  } catch (error) {
    console.error("Error in getProduct:", error);
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (
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

    const productData = {
      ...req.body,
      seller: req.user.id,
    };

    const product = await Product.create(productData);
    await product.populate("seller", "name avatar rating");

    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("seller", "name avatar rating");

    res.status(200).json({
      success: true,
      data: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is the seller or admin
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getSellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const sellerId = req.params.sellerId || req.user.id;

    const products = await Product.find({ seller: sellerId, isActive: true })
      .populate("seller", "name avatar rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({
      seller: sellerId,
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

// @desc    Like/Unlike product
// @route   POST /api/products/:id/like
// @access  Private
export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const userId = req.user.id;
    const isLiked = product.likes.includes(userId);

    if (isLiked) {
      product.likes = product.likes.filter((id) => id.toString() !== userId);
    } else {
      product.likes.push(userId);
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: product.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
