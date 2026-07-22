import mongoose, { Schema } from "mongoose";

// Links a patient with a caregiver. Created from "Add Caregiver" screen (patient side).
const caregiverLinkSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // caregiver may or may not already have a SafeMed Rx account
    caregiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },

    relationship: {
      type: String, // Daughter, Mother, Husband, Nurse, Wife, Father, Sibling, Son, Doctor, Other
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "pending", "removed"],
      default: "active",
    },

    notifyOnTaken: { type: Boolean, default: true },
    notifyOnMissed: { type: Boolean, default: true },
    notifyOnSkipped: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CaregiverLink = mongoose.model("CaregiverLink", caregiverLinkSchema);

export default CaregiverLink;
