import "dotenv/config";
import mongoose from "mongoose";
import Interaction from "../model/interaction.model.js";
import User from "../model/user.model.js";

const interactions = [
  {
    drugA: "Aspirin 81mg",
    drugB: "Warfarin (if prescribed)",
    severity: "high",
    effect: "Increased bleeding risk. Both drugs inhibit platelet function.",
    recommendation: "Avoid combination. Consult your physician immediately.",
  },
  {
    drugA: "Vitamin D3",
    drugB: "Warfarin (if prescribed)",
    severity: "low",
    effect: "Increased bleeding risk. Both drugs inhibit platelet function.",
    recommendation: "Generally safe. Monitor for muscle pain or weakness.",
  },
  {
    drugA: "Lisinopril",
    drugB: "Potassium supplements",
    severity: "moderate",
    effect: "ACE inhibitors can raise potassium levels. Combining may cause hyperkalemia.",
    recommendation: "Avoid potassium-rich supplements. Monitor kidney function.",
  },
  {
    drugA: "Warfarin",
    drugB: "Aspirin",
    severity: "high",
    effect: "Significantly increases bleeding risk due to additive anticoagulant effects.",
    recommendation: "Avoid combination. If unavoidable, monitor INR closely and watch for signs of bleeding.",
  },
  {
    drugA: "Metoprolol",
    drugB: "Verapamil",
    severity: "moderate",
    effect: "Additive negative chronotropic and dromotropic effects may cause bradycardia or heart block.",
    recommendation: "Use with caution. Monitor heart rate and PR interval. Avoid IV combination.",
  },
  {
    drugA: "Aspirin",
    drugB: "Ibuprofen",
    severity: "low",
    effect: "Ibuprofen may competitively inhibit aspirin's irreversible platelet binding, reducing cardioprotection.",
    recommendation: "If cardioprotection is needed, take aspirin 30 min before or 8 h after ibuprofen.",
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_DB_URL);
  console.log("MongoDB connected for seeding");

  await Interaction.deleteMany({});
  await Interaction.insertMany(interactions);
  console.log(`Seeded ${interactions.length} interactions`);

  // seed a default admin user for the web dashboard, if not already present
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@safemedrx.com",
      password: "Admin@123",
      phoneNumber: "+10000000000",
      role: "admin",
      isEmailVerified: true,
    });
    console.log("Seeded default admin -> admin@safemedrx.com / Admin@123");
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
