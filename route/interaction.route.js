import express from "express";
import {
  checkMyInteractions,
  getAllInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
} from "../controller/interaction.controller.js";
import { protect, isPatient, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/check", protect, isPatient, checkMyInteractions);
router.get("/", protect, isAdmin, getAllInteractions);
router.post("/", protect, isAdmin, createInteraction);
router.put("/:id", protect, isAdmin, updateInteraction);
router.delete("/:id", protect, isAdmin, deleteInteraction);

export default router;
