import mongoose, { Schema } from "mongoose";

// One document per scheduled intake of a medication on a given day.
// Powers Home screen "Today's Adherence", "Today" tab, and Caregiver "Missed Medications".
const doseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    medication: {
      type: Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
      index: true,
    },

    // "YYYY-MM-DD" - the calendar day this dose belongs to
    dateKey: {
      type: String,
      required: true,
      index: true,
    },

    // scheduled clock time, e.g. "08:00"
    scheduledTime: {
      type: String,
      required: true,
    },

    // Morning / Afternoon / Night bucket shown in the Today's Schedule card
    slot: {
      type: String,
      enum: ["Morning", "Afternoon", "Night"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "taken", "missed", "skipped"],
      default: "pending",
    },

    takenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

doseSchema.index({ user: 1, medication: 1, dateKey: 1, scheduledTime: 1 }, { unique: true });

const Dose = mongoose.model("Dose", doseSchema);

export default Dose;
