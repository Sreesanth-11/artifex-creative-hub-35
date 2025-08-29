import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import Product from "../models/Product";

// Get user's cart
export const getCart = async (
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

    const user = await User.findById(userId).populate({
      path: "cart.product",
      select: "title description price originalPrice images category seller isActive",
      populate: {
        path: "seller",
        select: "name avatar",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Filter out inactive products
    const activeCartItems = user.cart.filter((item: any) => 
      item.product && item.product.isActive
    );

    res.json({
      success: true,
      data: {
        cart: activeCartItems,
        totalItems: activeCartItems.length,
        totalAmount: activeCartItems.reduce((total: number, item: any) => 
          total + (item.product.price * item.quantity), 0
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    next(error);
  }
};

// Add item to cart
export const addToCart = async (
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
    const { productId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: "Product not found or inactive",
      });
    }

    // Check if user is trying to add their own product
    if (product.seller.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot add your own product to cart",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if product is already in cart
    const existingItemIndex = user.cart.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity,
        addedAt: new Date(),
      });
    }

    await user.save();

    // Populate the cart for response
    await user.populate({
      path: "cart.product",
      select: "title description price originalPrice images category seller",
      populate: {
        path: "seller",
        select: "name avatar",
      },
    });

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      data: {
        cart: user.cart,
        totalItems: user.cart.length,
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (
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
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const itemIndex = user.cart.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: "Cart item updated",
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

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

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(
      (item: any) => item.product.toString() !== productId
    );

    if (user.cart.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    await user.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      data: {
        cart: user.cart,
        totalItems: user.cart.length,
      },
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    next(error);
  }
};

// Clear entire cart
export const clearCart = async (
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: "Cart cleared",
      data: {
        cart: [],
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    next(error);
  }
};
