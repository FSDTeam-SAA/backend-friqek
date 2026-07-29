import express from "express";
import {
  getPlans,
  getMySubscription,
  subscribeToPlan,
  cancelSubscription,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controller/plan.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Subscription Plan screen
router.get("/", protect, getPlans); // ?billingCycle=monthly|yearly
router.get("/my-subscription", protect, getMySubscription);
router.post("/subscribe", protect, subscribeToPlan);
router.patch("/cancel", protect, cancelSubscription);

// Admin - plan catalog management
router.post("/", protect, isAdmin, createPlan);
router.put("/:id", protect, isAdmin, updatePlan);
router.delete("/:id", protect, isAdmin, deletePlan);

export default router;