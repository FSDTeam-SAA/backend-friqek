import express from "express";
import {
  getMyCaregivers,
  addCaregiver,
  updateCaregiverNotifySettings,
  removeCaregiver,
  getCaregiverHome,
  getMyPatients,
  getPatientDetail,
  getAdherenceOverview,
} from "../controller/caregiver.controller.js";
import { protect, isPatient, isCaregiver } from "../middleware/auth.middleware.js";

const router = express.Router();

// ---- Patient side: My Caregivers ----
router.get("/my-caregivers", protect, isPatient, getMyCaregivers);
router.post("/my-caregivers", protect, isPatient, addCaregiver);
router.patch("/my-caregivers/:id/notify-settings", protect, isPatient, updateCaregiverNotifySettings);
router.delete("/my-caregivers/:id", protect, isPatient, removeCaregiver);

// ---- Caregiver side: My Patients / Home / Adherence ----
router.get("/home", protect, isCaregiver, getCaregiverHome);
router.get("/my-patients", protect, isCaregiver, getMyPatients);
router.get("/my-patients/:linkId", protect, isCaregiver, getPatientDetail);
router.get("/adherence", protect, isCaregiver, getAdherenceOverview);

export default router;
