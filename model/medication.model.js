import mongoose, { Schema } from "mongoose";

// Maps to "Add Medication" form + "My Medications" list screen
const medicationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true,
    },

    dosage: {
      type: String, // e.g. "500mg"
      required: [true, "Dosage is required"],
      trim: true,
    },

    frequency: {
      type: String, // e.g. "Once daily", "Twice a day"
      required: [true, "Frequency is required"],
      trim: true,
    },

    // e.g. ["08:00", "20:00"] used to auto generate daily doses
    times: {
      type: [String],
      default: [],
    },

    prescribedBy: {
      type: String,
      trim: true,
      default: "",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    category: {
      type: String, // e.g. Blood Pressure, Diabetics, Cholesterol
      trim: true,
      default: "",
    },

    instructions: {
      type: String, // e.g. "Take with food", "30 min before meal"
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);

export default Medication;
