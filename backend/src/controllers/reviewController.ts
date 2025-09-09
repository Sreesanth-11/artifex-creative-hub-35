import { Request, Response, NextFunction } from "express";
import { Review, Product, User } from "../models";
import { validationResult } from "express-validator";

// @desc    Create a new review
// @route   POST /api/reviews/product/:productId
// @access  Private
export const createReview = async (
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
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this product",
      });
    }

    // Create new review
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await review.save();
    await review.populate("user", "name avatar");

    // Update product rating and review count
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    res.status(201).json({
      success: true,
      data: {
        review: {
          id: review._id,
          user: (review.user as any)?.name || "Anonymous",
          avatar: (review.user as any)?.avatar || "/api/placeholder/40/40",
          rating: review.rating,
          date: new Date(review.createdAt).toLocaleDateString(),
          comment: review.comment,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    const transformedReviews = reviews.map((review) => ({
      id: review._id,
      user: (review.user as any)?.name || "Anonymous",
      avatar: (review.user as any)?.avatar || "/api/placeholder/40/40",
      rating: review.rating,
      date: new Date(review.createdAt).toLocaleDateString(),
      comment: review.comment,
      helpfulCount: review.helpfulVotes.length,
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews: transformedReviews,
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

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (
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
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own reviews",
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    await review.save();
    await review.populate("user", "name avatar");

    // Update product rating
    const productId = review.product;
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    res.status(200).json({
      success: true,
      data: {
        review: {
          id: review._id,
          user: (review.user as any)?.name || "Anonymous",
          avatar: (review.user as any)?.avatar || "/api/placeholder/40/40",
          rating: review.rating,
          date: new Date(review.createdAt).toLocaleDateString(),
          comment: review.comment,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews",
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle helpful vote on a review
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
export const toggleHelpfulVote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    const hasVoted = review.helpfulVotes.includes(userId as any);

    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        (vote) => vote.toString() !== userId
      );
    } else {
      // Add vote
      review.helpfulVotes.push(userId as any);
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: {
        isHelpful: !hasVoted,
        helpfulCount: review.helpfulVotes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
