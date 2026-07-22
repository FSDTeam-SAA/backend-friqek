import express from "express";
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  forgetPassword,
  verifyResetPasswordOTP,
  resetPassword,
  logout,
} from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/verify-reset-otp", verifyResetPasswordOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logout);

export default router;
