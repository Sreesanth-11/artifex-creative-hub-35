import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  toggleLike,
} from "../controllers/productController";
import Product from "../models/Product";
import { protect, optionalAuth } from "../middleware/auth";
import {
  createProductValidation,
  updateProductValidation,
} from "../utils/validators";

const router = express.Router();

// Public routes
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category: string) => {
        const count = await Product.countDocuments({
          category,
          isActive: true,
        });
        return { name: category, count };
      })
    );

    res.json({
      success: true,
      data: { categories: categoriesWithCounts },
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProduct);
// This single route now handles fetching products for a specific seller,
// including the currently authenticated user's products.
router.get("/seller/:sellerId", optionalAuth, getSellerProducts);

// Protected routes
router.post("/", protect, createProductValidation, createProduct);
router.put("/:id", protect, updateProductValidation, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/like", protect, toggleLike);

export default router;
