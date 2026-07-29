import express from "express";

import authRoute from "../route/auth.route.js";
import userRoute from "../route/user.route.js";
import medicationRoute from "../route/medication.route.js";
import doseRoute from "../route/dose.route.js";
import interactionRoute from "../route/interaction.route.js";
import caregiverRoute from "../route/caregiver.route.js";
import notificationRoute from "../route/notification.route.js";
import adminRoute from "../route/admin.route.js";
import planRoute from "../route/plan.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/medication", medicationRoute);
router.use("/dose", doseRoute);
router.use("/interaction", interactionRoute);
router.use("/caregiver", caregiverRoute);
router.use("/notification", notificationRoute);
router.use("/admin", adminRoute);
router.use("/plan", planRoute);

export default router;
