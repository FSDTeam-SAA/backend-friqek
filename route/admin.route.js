import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
} from "../controller/admin.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, isAdmin, getDashboardStats);
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/users/:id", protect, isAdmin, getUserById);
router.patch("/users/:id/toggle-status", protect, isAdmin, toggleUserStatus);
router.delete("/users/:id", protect, isAdmin, deleteUser);

export default router;
