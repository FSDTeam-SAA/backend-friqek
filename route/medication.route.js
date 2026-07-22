import express from "express";
import {
  getMyMedications,
  getMedicationById,
  addMedication,
  updateMedication,
  deleteMedication,
} from "../controller/medication.controller.js";
import { protect, isPatient } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, isPatient, getMyMedications);
router.get("/:id", protect, isPatient, getMedicationById);
router.post("/", protect, isPatient, addMedication);
router.put("/:id", protect, isPatient, updateMedication);
router.delete("/:id", protect, isPatient, deleteMedication);

export default router;
