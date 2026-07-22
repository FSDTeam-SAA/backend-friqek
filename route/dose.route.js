import express from "express";
import {
  getHomeSummary,
  getTodaySchedule,
  takeDose,
  skipDose,
} from "../controller/dose.controller.js";
import { protect, isPatient } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/home", protect, isPatient, getHomeSummary);
router.get("/today", protect, isPatient, getTodaySchedule);
router.patch("/:doseId/take", protect, isPatient, takeDose);
router.patch("/:doseId/skip", protect, isPatient, skipDose);

export default router;
