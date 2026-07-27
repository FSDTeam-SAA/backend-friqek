import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import Medication from "../model/medication.model.js";
import Dose from "../model/dose.model.js";
import { ensureTodayDoses } from "../utils/doseHelper.js";

export const getMyMedications = catchAsync(async (req, res) => {
  const { search } = req.query;

  const filter = { user: req.user._id };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const medications = await Medication.find(filter).sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medications fetched",
    data: medications,
    meta: { total: medications.length, activeCount: medications.filter((m) => m.isActive).length },
  });
});

export const getMedicationById = catchAsync(async (req, res) => {
  const medication = await Medication.findOne({ _id: req.params.id, user: req.user._id });

  if (!medication) {
    throw new AppError(httpStatus.NOT_FOUND, "Medication not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medication fetched",
    data: medication,
  });
});

export const addMedication = catchAsync(async (req, res) => {
  const {
    name,
    dosage,
    frequency,
    times,
    prescribedBy,
    startDate,
    category,
    instructions,
  } = req.body;

  if (!name || !dosage || !frequency) {
    throw new AppError(httpStatus.BAD_REQUEST, "Name, dosage and frequency are required");
  }

  const timesArray = Array.isArray(times)
    ? times
    : String(times || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  const medication = await Medication.create({
    user: req.user._id,
    name,
    dosage,
    frequency,
    times: timesArray,
    prescribedBy,
    startDate: startDate ? new Date(startDate) : new Date(),
    category,
    instructions,
  });

  await ensureTodayDoses(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Medication added successfully",
    data: medication,
  });
});

export const updateMedication = catchAsync(async (req, res) => {
  const medication = await Medication.findOne({ _id: req.params.id, user: req.user._id });

  if (!medication) {
    throw new AppError(httpStatus.NOT_FOUND, "Medication not found");
  }

  const {
    name,
    dosage,
    frequency,
    times,
    prescribedBy,
    startDate,
    category,
    instructions,
    isActive,
  } = req.body;

  if (name) medication.name = name;
  if (dosage) medication.dosage = dosage;
  if (frequency) medication.frequency = frequency;
  if (times) {
    medication.times = Array.isArray(times)
      ? times
      : String(times).split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (prescribedBy !== undefined) medication.prescribedBy = prescribedBy;
  if (startDate) medication.startDate = new Date(startDate);
  if (category !== undefined) medication.category = category;
  if (instructions !== undefined) medication.instructions = instructions;
  if (isActive !== undefined) medication.isActive = isActive;

  await medication.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medication updated successfully",
    data: medication,
  });
});

export const deleteMedication = catchAsync(async (req, res) => {
  const medication = await Medication.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!medication) {
    throw new AppError(httpStatus.NOT_FOUND, "Medication not found");
  }

  await Dose.deleteMany({ medication: medication._id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Medication removed successfully",
    data: null,
  });
});
