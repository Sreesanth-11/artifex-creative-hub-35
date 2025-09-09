import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import {
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
} from "../utils/validators";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/updatedetails", protect, updateDetailsValidation, updateDetails);
router.put(
  "/updatepassword",
  protect,
  updatePasswordValidation,
  updatePassword
);

export default router;
