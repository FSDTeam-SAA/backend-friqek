import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

export default router;
