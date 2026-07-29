import mongoose, { Schema } from "mongoose";

// Screen: Subscription Plan (Personal / Premium cards, Monthly/Yearly toggle)
const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // "Personal", "Premium"

    description: { type: String, default: "" },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    price: { type: Number, required: true, default: 0 }, // 0 = Free

    currency: { type: String, default: "USD" },

    features: { type: [String], default: [] },

    badge: { type: String, default: "" }, // e.g. "Best Value"

    isPopular: { type: Boolean, default: false }, // "Most popular" ribbon

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;