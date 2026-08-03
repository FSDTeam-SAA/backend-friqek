

// import Dose from "../model/dose.model.js";
// import Medication from "../model/medication.model.js";
// import { getTodayKey } from "./commonMethod.js";
// import { notifyCaregivers } from "./notifyHelper.js";

// // Morning: 04:00-11:59, Afternoon: 12:00-17:59, Night: 18:00-03:59
// export const getSlotFromTime = (time) => {
//   const [h] = String(time).split(":").map(Number);
//   if (h >= 4 && h < 12) return "Morning";
//   if (h >= 12 && h < 18) return "Afternoon";
//   return "Night";
// };

// // Ensures every active medication of a user has a Dose document for "today"
// // for each of its scheduled times. Safe to call repeatedly (upsert).
// export const ensureTodayDoses = async (userId, dateKey = getTodayKey()) => {
//   const medications = await Medication.find({ user: userId, isActive: true });

//   for (const med of medications) {
//     const times = med.times?.length ? med.times : ["08:00"];

//     for (const time of times) {
//       await Dose.findOneAndUpdate(
//         { user: userId, medication: med._id, dateKey, scheduledTime: time },
//         {
//           $setOnInsert: {
//             user: userId,
//             medication: med._id,
//             dateKey,
//             scheduledTime: time,
//             slot: getSlotFromTime(time),
//             status: "pending",
//           },
//         },
//         { upsert: true, returnDocument: "after", }
//       );
//     }
//   }
// };

// // Auto-mark doses whose scheduled time has passed by more than 1 hour as "missed"
// // and notify any linked caregivers who have "notify on missed" turned on.
// export const autoMarkMissed = async (userId, dateKey = getTodayKey()) => {
//   if (dateKey !== getTodayKey()) return; // only relevant for today

//   const now = new Date();
//   const doses = await Dose.find({ user: userId, dateKey, status: "pending" }).populate(
//     "medication",
//     "name dosage"
//   );

//   for (const dose of doses) {
//     const [h, m] = dose.scheduledTime.split(":").map(Number);
//     const scheduled = new Date();
//     scheduled.setHours(h, m, 0, 0);

//     if (now.getTime() - scheduled.getTime() > 60 * 60 * 1000) {
//       dose.status = "missed";
//       await dose.save();
//       await notifyCaregivers(userId, dose, "missed");
//     }
//   }
// };


import Dose from "../model/dose.model.js";
import Medication from "../model/medication.model.js";
import { getTodayKey } from "./commonMethod.js";
import { notifyCaregivers } from "./notifyHelper.js";

// Morning: 04:00-11:59, Afternoon: 12:00-17:59, Night: 18:00-03:59
export const getSlotFromTime = (time) => {
  const [h] = String(time).split(":").map(Number);
  if (h >= 4 && h < 12) return "Morning";
  if (h >= 12 && h < 18) return "Afternoon";
  return "Night";
};

// Ensures every active medication of a user has a Dose document for "today"
// for each of its scheduled times. Safe to call repeatedly (upsert).
export const ensureTodayDoses = async (userId, dateKey = getTodayKey()) => {
  const medications = await Medication.find({ user: userId, isActive: true });

  for (const med of medications) {
    const times = med.times?.length ? med.times : ["08:00"];

    for (const time of times) {
      await Dose.findOneAndUpdate(
        { user: userId, medication: med._id, dateKey, scheduledTime: time },
        {
          $setOnInsert: {
            user: userId,
            medication: med._id,
            dateKey,
            scheduledTime: time,
            slot: getSlotFromTime(time),
            status: "pending",
          },
        },
        { upsert: true, new: true }
      );
    }
  }
};

// Auto-mark doses whose scheduled time has passed by more than 1 hour as "missed"
// and notify any linked caregivers who have "notify on missed" turned on.
export const autoMarkMissed = async (userId, dateKey = getTodayKey()) => {
  if (dateKey !== getTodayKey()) return; // only relevant for today

  const now = new Date();
  const doses = await Dose.find({ user: userId, dateKey, status: "pending" }).populate(
    "medication",
    "name dosage"
  );

  for (const dose of doses) {
    const [h, m] = dose.scheduledTime.split(":").map(Number);
    const scheduled = new Date();
    scheduled.setHours(h, m, 0, 0);

    if (now.getTime() - scheduled.getTime() > 60 * 60 * 1000) {
      dose.status = "missed";
      await dose.save();
      await notifyCaregivers(userId, dose, "missed");
    }
  }
};