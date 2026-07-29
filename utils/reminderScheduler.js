import Dose from "../model/dose.model.js";
import Notification from "../model/notification.model.js";
import { getTodayKey } from "./commonMethod.js";

// Screen: Patient Home/Today bell icon - "Time to take your Metformin" reminder.
// Runs on an interval (see server.js). For every pending dose whose scheduled
// time has arrived (current time >= scheduledTime, same day) and no reminder
// has been sent yet, create a Notification for the patient themself.
export const sendDueDoseReminders = async () => {
  const dateKey = getTodayKey();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dueDoses = await Dose.find({
    dateKey,
    status: "pending",
    reminderSent: false,
  }).populate("medication", "name dosage");

  for (const dose of dueDoses) {
    const [h, m] = dose.scheduledTime.split(":").map(Number);
    const scheduledMinutes = h * 60 + m;

    if (currentMinutes >= scheduledMinutes) {
      const medName = dose.medication?.name || "your medication";
      const dosage = dose.medication?.dosage || "";

      await Notification.create({
        recipient: dose.user, // patient notifies themself
        patient: dose.user,
        type: "reminder",
        medicationName: dose.medication?.name || "",
        dosage,
        message: `Time to take your ${medName} ${dosage}`.trim(),
      });

      dose.reminderSent = true;
      await dose.save();
    }
  }
};

// Called once at server startup; re-checks every minute.
export const startReminderScheduler = () => {
  setInterval(() => {
    sendDueDoseReminders().catch((err) =>
      console.error("Dose reminder scheduler error:", err)
    );
  }, 60 * 1000);

  console.log("Dose reminder scheduler started (checks every 60s)");
};