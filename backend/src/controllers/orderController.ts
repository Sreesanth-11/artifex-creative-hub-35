import { Request, Response, NextFunction } from "express";
import { Order, Product, User } from "../models";
import { validationResult } from "express-validator";
import Stripe from "stripe";

// Initialize Stripe only if we have a valid key
const isTestMode =
  !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY === "sk_test_your_stripe_secret_key";
const stripe = isTestMode
  ? null
  : new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-10-16",
    });

// @desc    Create a new order (purchase)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (
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
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check if user is trying to buy their own product
    if ((product.seller as any)._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot purchase your own product",
      });
    }

    // Check if user already owns this product
    const existingOrder = await Order.findOne({
      buyer: userId,
      product: productId,
      status: "completed",
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: "You already own this product",
      });
    }

    let paymentIntentId = null;
    let clientSecret = null;

    if (isTestMode) {
      // Test mode - simulate successful payment
      paymentIntentId = `test_pi_${Date.now()}`;
      clientSecret = `test_secret_${Date.now()}`;
    } else {
      // Production mode - create actual Stripe payment intent
      const paymentIntent = await stripe!.paymentIntents.create({
        amount: Math.round(product.price * 100), // Convert to cents
        currency: "inr",
        metadata: {
          productId: productId,
          buyerId: userId,
          sellerId: (product.seller as any)._id.toString(),
        },
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    }

    // Create order
    const order = new Order({
      buyer: userId,
      seller: (product.seller as any)._id,
      product: productId,
      amount: product.price,
      paymentIntentId: paymentIntentId,
      status: isTestMode ? "completed" : "pending", // Auto-complete in test mode
    });

    await order.save();

    // Update product stats
    if (isTestMode) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { downloads: 1 },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        clientSecret: clientSecret,
        amount: product.price,
        testMode: isTestMode,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
  }
};

// @desc    Confirm order payment
// @route   POST /api/orders/confirm
// @access  Private
export const confirmOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Find order by payment intent ID
    const order = await Order.findOne({ paymentIntentId }).populate([
      { path: "product", select: "title seller downloads" },
      { path: "buyer", select: "name email" },
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify payment with Stripe (skip in test mode)
    if (isTestMode) {
      // In test mode, assume payment is successful
      order.status = "completed";
      await order.save();

      // Increment product downloads count
      const product = await Product.findById(order.product);
      if (product) {
        product.downloads += 1;
        await product.save();
      }

      return res.json({
        success: true,
        message: "Order completed successfully (test mode)",
        data: {
          order,
        },
      });
    }

    // Production mode - verify with Stripe
    const paymentIntent = await stripe!.paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      // Update order status
      order.status = "completed";
      await order.save();

      // Increment product downloads count
      const product = await Product.findById(order.product);
      if (product) {
        product.downloads += 1;
        await product.save();
      }

      // Update seller's total sales
      const seller = await User.findById(order.seller);
      if (seller) {
        seller.totalSales += order.amount;
        await seller.save();
      }

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: {
          orderId: order._id,
          downloadUrl: `/api/downloads/file/${order._id}`,
        },
      });
    } else {
      // Payment failed
      order.status = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        error: "Payment failed",
      });
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyer: userId })
      .populate({
        path: "product",
        select: "title description price category images",
        populate: {
          path: "seller",
          select: "name avatar",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ buyer: userId });

    const transformedOrders = orders.map((order) => ({
      id: order._id,
      product: {
        id: (order.product as any)._id,
        title: (order.product as any).title,
        description: (order.product as any).description,
        price: (order.product as any).price,
        category: (order.product as any).category,
        image: (order.product as any).images[0] || "/api/placeholder/200/150",
        seller: {
          name: (order.product as any).seller?.name || "Unknown",
          avatar:
            (order.product as any).seller?.avatar || "/api/placeholder/40/40",
        },
      },
      amount: order.amount,
      status: order.status,
      downloadCount: order.downloadCount || 0,
      maxDownloads: order.maxDownloads || 5,
      canDownload:
        order.status === "completed" &&
        (order.downloadCount || 0) < (order.maxDownloads || 5),
      purchaseDate: new Date(order.createdAt).toLocaleDateString(),
      expiresAt: order.expiresAt
        ? new Date(order.expiresAt).toLocaleDateString()
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: transformedOrders,
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

// @desc    Get seller's sales
// @route   GET /api/orders/sales
// @access  Private
export const getSellerSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ seller: userId, status: "completed" })
      .populate([
        {
          path: "product",
          select: "title description price category images",
        },
        {
          path: "buyer",
          select: "name avatar",
        },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({
      seller: userId,
      status: "completed",
    });

    const transformedOrders = orders.map((order) => ({
      id: order._id,
      product: {
        id: (order.product as any)._id,
        title: (order.product as any).title,
        description: (order.product as any).description,
        price: (order.product as any).price,
        category: (order.product as any).category,
        image: (order.product as any).images[0] || "/api/placeholder/200/150",
      },
      buyer: {
        name: (order.buyer as any)?.name || "Unknown",
        avatar: (order.buyer as any)?.avatar || "/api/placeholder/40/40",
      },
      amount: order.amount,
      saleDate: new Date(order.createdAt).toLocaleDateString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        sales: transformedOrders,
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

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findById(orderId).populate([
      {
        path: "product",
        select: "title description price category images files",
        populate: {
          path: "seller",
          select: "name avatar",
        },
      },
      {
        path: "buyer",
        select: "name avatar",
      },
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if user has access to this order
    if (
      order.buyer.toString() !== userId &&
      order.seller.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const transformedOrder = {
      id: order._id,
      product: {
        id: (order.product as any)._id,
        title: (order.product as any).title,
        description: (order.product as any).description,
        price: (order.product as any).price,
        category: (order.product as any).category,
        images: (order.product as any).images,
        files: (order.product as any).files,
        seller: {
          name: (order.product as any).seller?.name || "Unknown",
          avatar:
            (order.product as any).seller?.avatar || "/api/placeholder/40/40",
        },
      },
      buyer: {
        name: (order.buyer as any)?.name || "Unknown",
        avatar: (order.buyer as any)?.avatar || "/api/placeholder/40/40",
      },
      amount: order.amount,
      status: order.status,
      downloadCount: order.downloadCount || 0,
      maxDownloads: order.maxDownloads || 5,
      canDownload:
        order.status === "completed" &&
        (order.downloadCount || 0) < (order.maxDownloads || 5),
      purchaseDate: new Date(order.createdAt).toLocaleDateString(),
      expiresAt: order.expiresAt
        ? new Date(order.expiresAt).toLocaleDateString()
        : null,
    };

    res.status(200).json({
      success: true,
      data: { order: transformedOrder },
    });
  } catch (error) {
    next(error);
  }
};
