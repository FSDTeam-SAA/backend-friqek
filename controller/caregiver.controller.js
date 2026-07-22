import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import CaregiverLink from "../model/caregiverLink.model.js";
import User from "../model/user.model.js";
import Medication from "../model/medication.model.js";
import Dose from "../model/dose.model.js";
import { getTodayKey } from "../utils/commonMethod.js";
import { ensureTodayDoses, autoMarkMissed } from "../utils/doseHelper.js";

// ---------------- Patient side: "My Caregivers" ----------------

// Screen: My Caregivers (list)
export const getMyCaregivers = catchAsync(async (req, res) => {
  const caregivers = await CaregiverLink.find({
    patient: req.user._id,
    status: { $ne: "removed" },
  }).sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Caregivers fetched",
    data: caregivers,
  });
});

// Screen: Add Caregiver (modal form)
export const addCaregiver = catchAsync(async (req, res) => {
  const { fullName, phoneNumber, email, relationship } = req.body;

  if (!fullName || !phoneNumber || !relationship) {
    throw new AppError(httpStatus.BAD_REQUEST, "Full name, phone and relationship are required");
  }

  // link to an existing caregiver account if the email matches one
  let caregiverUser = null;
  if (email) {
    caregiverUser = await User.findOne({ email: email.toLowerCase().trim(), role: "caregiver" });
  }

  const link = await CaregiverLink.create({
    patient: req.user._id,
    caregiver: caregiverUser?._id || null,
    fullName,
    phoneNumber,
    email: email?.toLowerCase().trim() || "",
    relationship,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Caregiver added successfully",
    data: link,
  });
});

// Screen: My Caregivers -> "Notify When" toggles (Medication taken/missed/skipped)
export const updateCaregiverNotifySettings = catchAsync(async (req, res) => {
  const { notifyOnTaken, notifyOnMissed, notifyOnSkipped } = req.body;

  const link = await CaregiverLink.findOne({ _id: req.params.id, patient: req.user._id });

  if (!link) {
    throw new AppError(httpStatus.NOT_FOUND, "Caregiver not found");
  }

  if (notifyOnTaken !== undefined) link.notifyOnTaken = notifyOnTaken;
  if (notifyOnMissed !== undefined) link.notifyOnMissed = notifyOnMissed;
  if (notifyOnSkipped !== undefined) link.notifyOnSkipped = notifyOnSkipped;

  await link.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification settings updated",
    data: link,
  });
});

// Screen: My Caregivers -> trash icon
export const removeCaregiver = catchAsync(async (req, res) => {
  const link = await CaregiverLink.findOneAndUpdate(
    { _id: req.params.id, patient: req.user._id },
    { status: "removed" },
    { new: true }
  );

  if (!link) {
    throw new AppError(httpStatus.NOT_FOUND, "Caregiver not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Caregiver removed successfully",
    data: null,
  });
});

// ---------------- Caregiver side: "My Patients" / Home / Adherence ----------------

const buildPatientOverview = async (patientId) => {
  const dateKey = getTodayKey();
  await ensureTodayDoses(patientId, dateKey);
  await autoMarkMissed(patientId, dateKey);

  const doses = await Dose.find({ user: patientId, dateKey });
  const taken = doses.filter((d) => d.status === "taken").length;
  const missed = doses.filter((d) => d.status === "missed").length;
  const weeklyAdherence = doses.length ? Math.round((taken / doses.length) * 100) : 0;

  return { taken, missed, total: doses.length, weeklyAdherence };
};

// Screen: Caregiver Home - "5 Monitored / 1 On Track / 2 Missed" + patient list
export const getCaregiverHome = catchAsync(async (req, res) => {
  const links = await CaregiverLink.find({ caregiver: req.user._id, status: "active" }).populate(
    "patient",
    "name age medicalConditions allergies emergencyContact"
  );

  const patients = [];
  let onTrack = 0;
  let missedCount = 0;

  for (const link of links) {
    const overview = await buildPatientOverview(link.patient._id);
    const status = overview.missed > 0 ? "Missed" : "On Track";
    if (status === "On Track") onTrack += 1;
    else missedCount += 1;

    patients.push({
      linkId: link._id,
      patient: link.patient,
      relationship: link.relationship,
      status,
      weeklyAdherence: overview.weeklyAdherence,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Caregiver home summary fetched",
    data: {
      monitored: patients.length,
      onTrack,
      missed: missedCount,
      alerts: patients.filter((p) => p.status === "Missed"),
      patients,
    },
  });
});

// Screen: All Patients (caregiver "Patients" tab, with search)
export const getMyPatients = catchAsync(async (req, res) => {
  const { search } = req.query;

  const links = await CaregiverLink.find({ caregiver: req.user._id, status: "active" }).populate(
    "patient",
    "name age medicalConditions allergies emergencyContact"
  );

  const patients = [];
  for (const link of links) {
    if (search && !link.patient.name.toLowerCase().includes(search.toLowerCase())) continue;
    const overview = await buildPatientOverview(link.patient._id);
    patients.push({
      linkId: link._id,
      patient: link.patient,
      relationship: link.relationship,
      status: overview.missed > 0 ? "Missed" : "On Track",
      weeklyAdherence: overview.weeklyAdherence,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients fetched",
    data: patients,
    meta: { alertsToday: patients.filter((p) => p.status === "Missed").length },
  });
});

// Screen: Missed Medications Today (patient detail view for a caregiver)
export const getPatientDetail = catchAsync(async (req, res) => {
  const link = await CaregiverLink.findOne({
    _id: req.params.linkId,
    caregiver: req.user._id,
    status: "active",
  }).populate("patient", "name age medicalConditions allergies emergencyContact");

  if (!link) {
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
  }

  const dateKey = req.query.date || getTodayKey();
  await ensureTodayDoses(link.patient._id, dateKey);
  await autoMarkMissed(link.patient._id, dateKey);

  const doses = await Dose.find({ user: link.patient._id, dateKey })
    .populate("medication", "name dosage")
    .sort({ scheduledTime: 1 });

  const grouped = { Morning: [], Afternoon: [], Night: [] };
  doses.forEach((d) => grouped[d.slot].push(d));

  const taken = doses.filter((d) => d.status === "taken").length;
  const weeklyAdherence = doses.length ? Math.round((taken / doses.length) * 100) : 0;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient detail fetched",
    data: {
      patient: link.patient,
      status: doses.some((d) => d.status === "missed") ? "Missed" : "On Track",
      weeklyAdherence,
      medicationsCount: doses.length,
      streak: link.patient.currentStreakDays,
      schedule: grouped,
    },
  });
});

// Screen: Adherence tab (caregiver) - overall + per patient
export const getAdherenceOverview = catchAsync(async (req, res) => {
  const links = await CaregiverLink.find({ caregiver: req.user._id, status: "active" }).populate(
    "patient",
    "name"
  );

  let totalDoses = 0;
  let totalTaken = 0;
  const perPatient = [];

  for (const link of links) {
    const dateKey = getTodayKey();
    await ensureTodayDoses(link.patient._id, dateKey);
    const doses = await Dose.find({ user: link.patient._id, dateKey });
    const taken = doses.filter((d) => d.status === "taken").length;

    totalDoses += doses.length;
    totalTaken += taken;

    perPatient.push({
      linkId: link._id,
      patientName: link.patient.name,
      weeklyAdherence: doses.length ? Math.round((taken / doses.length) * 100) : 0,
    });
  }

  const overallPercentage = totalDoses ? Math.round((totalTaken / totalDoses) * 100) : 0;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Adherence overview fetched",
    data: {
      overall: {
        percentage: overallPercentage,
        takenPercentage: overallPercentage,
        missedPercentage: 100 - overallPercentage,
      },
      perPatient,
    },
  });
});
