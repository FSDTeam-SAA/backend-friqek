// import httpStatus from "http-status";
// import AppError from "../errors/AppError.js";
// import catchAsync from "../utils/catchAsync.js";
// import sendResponse from "../utils/sendResponse.js";
// import Dose from "../model/dose.model.js";
// import Medication from "../model/medication.model.js";
// import User from "../model/user.model.js";
// import CaregiverLink from "../model/caregiverLink.model.js";
// import Notification from "../model/notification.model.js";
// import { getTodayKey } from "../utils/commonMethod.js";
// import { ensureTodayDoses, autoMarkMissed } from "../utils/doseHelper.js";

// const buildSchedule = async (userId, dateKey) => {
//   const doses = await Dose.find({ user: userId, dateKey })
//     .populate("medication", "name dosage category")
//     .sort({ scheduledTime: 1 });

//   const grouped = { Morning: [], Afternoon: [], Night: [] };
//   doses.forEach((d) => grouped[d.slot].push(d));

//   const taken = doses.filter((d) => d.status === "taken").length;
//   const missed = doses.filter((d) => d.status === "missed").length;
//   const skipped = doses.filter((d) => d.status === "skipped").length;
//   const pending = doses.filter((d) => d.status === "pending").length;

//   return {
//     doses,
//     grouped,
//     summary: {
//       total: doses.length,
//       taken,
//       missed,
//       skipped,
//       pending,
//       percentage: doses.length ? Math.round((taken / doses.length) * 100) : 0,
//     },
//   };
// };

// export const getHomeSummary = catchAsync(async (req, res) => {
//   const dateKey = getTodayKey();
//   await ensureTodayDoses(req.user._id, dateKey);
//   await autoMarkMissed(req.user._id, dateKey);

//   const { grouped, summary } = await buildSchedule(req.user._id, dateKey);
//   const activeMeds = await Medication.countDocuments({ user: req.user._id, isActive: true });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Home summary fetched",
//     data: {
//       user: { name: req.user.name },
//       todaysAdherence: { taken: summary.taken, total: summary.total, percentage: summary.percentage },
//       activeMeds,
//       missed: summary.missed,
//       upcoming: summary.pending,
//       todaysSchedule: grouped,
//     },
//   });
// });

// export const getTodaySchedule = catchAsync(async (req, res) => {
//   const dateKey = req.query.date || getTodayKey();
//   await ensureTodayDoses(req.user._id, dateKey);
//   await autoMarkMissed(req.user._id, dateKey);

//   const { grouped, summary, doses } = await buildSchedule(req.user._id, dateKey);

//   const highlightedMissed = doses.find((d) => d.status === "missed") || null;

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Today's schedule fetched",
//     data: {
//       date: dateKey,
//       summary,
//       highlightedMissed,
//       schedule: grouped,
//     },
//   });
// });

// const notifyCaregivers = async (patient, dose, type) => {
//   const links = await CaregiverLink.find({ patient: patient._id, status: "active" });

//   const notifyField =
//     type === "taken" ? "notifyOnTaken" : type === "missed" ? "notifyOnMissed" : "notifyOnSkipped";

//   const verbMap = {
//     taken: "has taken",
//     missed: "missed",
//     skipped: "skipped",
//   };

//   await Promise.all(
//     links
//       .filter((link) => link[notifyField] && link.caregiver)
//       .map((link) =>
//         Notification.create({
//           recipient: link.caregiver,
//           patient: patient._id,
//           type,
//           medicationName: dose.medication?.name || "",
//           dosage: dose.medication?.dosage || "",
//           message: `${patient.name} ${verbMap[type]} ${dose.medication?.name || "medication"} ${
//             dose.medication?.dosage || ""
//           }`.trim(),
//         })
//       )
//   );
// };


// export const takeDose = catchAsync(async (req, res) => {
//   const dose = await Dose.findOne({ _id: req.params.doseId, user: req.user._id }).populate(
//     "medication",
//     "name dosage"
//   );

//   if (!dose) {
//     throw new AppError(httpStatus.NOT_FOUND, "Dose not found");
//   }

//   dose.status = "taken";
//   dose.takenAt = new Date();
//   await dose.save();

//   await notifyCaregivers(req.user, dose, "taken");

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Dose marked as taken",
//     data: dose,
//   });
// });

// export const skipDose = catchAsync(async (req, res) => {
//   const dose = await Dose.findOne({ _id: req.params.doseId, user: req.user._id }).populate(
//     "medication",
//     "name dosage"
//   );

//   if (!dose) {
//     throw new AppError(httpStatus.NOT_FOUND, "Dose not found");
//   }

//   dose.status = "skipped";
//   await dose.save();

//   await notifyCaregivers(req.user, dose, "skipped");

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Dose marked as skipped",
//     data: dose,
//   });
// });


import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import Dose from "../model/dose.model.js";
import Medication from "../model/medication.model.js";
import { getTodayKey } from "../utils/commonMethod.js";
import { ensureTodayDoses, autoMarkMissed } from "../utils/doseHelper.js";
import { notifyCaregivers } from "../utils/notifyHelper.js";

const buildSchedule = async (userId, dateKey) => {
  const doses = await Dose.find({ user: userId, dateKey })
    .populate("medication", "name dosage category")
    .sort({ scheduledTime: 1 });

  const grouped = { Morning: [], Afternoon: [], Night: [] };
  doses.forEach((d) => grouped[d.slot].push(d));

  const taken = doses.filter((d) => d.status === "taken").length;
  const missed = doses.filter((d) => d.status === "missed").length;
  const skipped = doses.filter((d) => d.status === "skipped").length;
  const pending = doses.filter((d) => d.status === "pending").length;

  return {
    doses,
    grouped,
    summary: {
      total: doses.length,
      taken,
      missed,
      skipped,
      pending,
      percentage: doses.length ? Math.round((taken / doses.length) * 100) : 0,
    },
  };
};

// Screen: Home (patient) - "Today's Adherence" card + Active Meds / Missed / Upcoming + Today's Schedule
export const getHomeSummary = catchAsync(async (req, res) => {
  const dateKey = getTodayKey();
  await ensureTodayDoses(req.user._id, dateKey);
  await autoMarkMissed(req.user._id, dateKey);

  const { grouped, summary } = await buildSchedule(req.user._id, dateKey);
  const activeMeds = await Medication.countDocuments({ user: req.user._id, isActive: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Home summary fetched",
    data: {
      user: { name: req.user.name },
      todaysAdherence: { taken: summary.taken, total: summary.total, percentage: summary.percentage },
      activeMeds,
      missed: summary.missed,
      upcoming: summary.pending,
      todaysSchedule: grouped,
    },
  });
});

// Screen: Today tab - full schedule + "3/6 doses completed today"
export const getTodaySchedule = catchAsync(async (req, res) => {
  const dateKey = req.query.date || getTodayKey();
  await ensureTodayDoses(req.user._id, dateKey);
  await autoMarkMissed(req.user._id, dateKey);

  const { grouped, summary, doses } = await buildSchedule(req.user._id, dateKey);

  // "Missed" highlight card at the top of the Today screen (first missed dose, if any)
  const highlightedMissed = doses.find((d) => d.status === "missed") || null;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Today's schedule fetched",
    data: {
      date: dateKey,
      summary,
      highlightedMissed,
      schedule: grouped,
    },
  });
});

// Screen: Home / Today - "Take" button
export const takeDose = catchAsync(async (req, res) => {
  const dose = await Dose.findOne({ _id: req.params.doseId, user: req.user._id }).populate(
    "medication",
    "name dosage"
  );

  if (!dose) {
    throw new AppError(httpStatus.NOT_FOUND, "Dose not found");
  }

  dose.status = "taken";
  dose.takenAt = new Date();
  await dose.save();

  await notifyCaregivers(req.user._id, dose, "taken");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dose marked as taken",
    data: dose,
  });
});

// Screen: Home / Today - "Skip" button
export const skipDose = catchAsync(async (req, res) => {
  const dose = await Dose.findOne({ _id: req.params.doseId, user: req.user._id }).populate(
    "medication",
    "name dosage"
  );

  if (!dose) {
    throw new AppError(httpStatus.NOT_FOUND, "Dose not found");
  }

  dose.status = "skipped";
  await dose.save();

  await notifyCaregivers(req.user._id, dose, "skipped");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dose marked as skipped",
    data: dose,
  });
});