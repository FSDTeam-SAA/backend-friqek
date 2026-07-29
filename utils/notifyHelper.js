import CaregiverLink from "../model/caregiverLink.model.js";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";

// Creates a Notification for every caregiver linked to `patientId` who has
// the matching notify-toggle turned on. `dose` must have `medication`
// populated (name, dosage) before calling this.
export const notifyCaregivers = async (patientId, dose, type) => {
  const patient = await User.findById(patientId).select("name");
  if (!patient) return;

  const links = await CaregiverLink.find({ patient: patientId, status: "active" });

  const notifyField =
    type === "taken" ? "notifyOnTaken" : type === "missed" ? "notifyOnMissed" : "notifyOnSkipped";

  const verbMap = {
    taken: "has taken",
    missed: "missed",
    skipped: "skipped",
  };

  await Promise.all(
    links
      .filter((link) => link[notifyField] && link.caregiver)
      .map((link) =>
        Notification.create({
          recipient: link.caregiver,
          patient: patientId,
          type,
          medicationName: dose.medication?.name || "",
          dosage: dose.medication?.dosage || "",
          message: `${patient.name} ${verbMap[type]} ${dose.medication?.name || "medication"} ${
            dose.medication?.dosage || ""
          }`.trim(),
        })
      )
  );
};