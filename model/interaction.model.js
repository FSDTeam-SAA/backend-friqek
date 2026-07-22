import mongoose, { Schema } from "mongoose";

// Master drug-drug / drug-supplement interaction reference data.
// Managed by Admin dashboard ("Interactions" page), consumed by the
// patient app's "Interaction Checker" screen.
const interactionSchema = new Schema(
  {
    drugA: { type: String, required: true, trim: true },
    drugB: { type: String, required: true, trim: true },

    severity: {
      type: String,
      enum: ["high", "moderate", "low"],
      required: true,
    },

    // Clinical interaction effect description
    effect: { type: String, required: true },

    // Recommendation shown to the patient
    recommendation: { type: String, required: true },

    category: { type: String, default: "" },
  },
  { timestamps: true }
);

const Interaction = mongoose.model("Interaction", interactionSchema);

export default Interaction;
