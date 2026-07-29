import mongoose, { Schema } from "mongoose";

// Powers the caregiver "Notifications" / "Alerts" tab and the bell icon
// on the patient/caregiver Home screen.
const notificationSchema = new Schema(
  {
    // who should see this notification (caregiver, or patient for their own bell icon)
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // patient this notification is about
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["taken", "missed", "skipped", "reminder"],
      required: true,
    },

    medicationName: { type: String, default: "" },
    dosage: { type: String, default: "" },

    message: { type: String, required: true },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
