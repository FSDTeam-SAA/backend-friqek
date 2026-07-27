import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import Interaction from "../model/interaction.model.js";
import Medication from "../model/medication.model.js";

export const checkMyInteractions = catchAsync(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id, isActive: true });
  const medicationNames = medications.map((m) => m.name.toLowerCase());

  const allInteractions = await Interaction.find({});

  const flagged = allInteractions.filter((i) => {
    const a = i.drugA.toLowerCase();
    const b = i.drugB.toLowerCase();

    const matchA = medicationNames.some((name) => a.includes(name) || name.includes(a));
    const matchB = medicationNames.some((name) => b.includes(name) || name.includes(b));
    return matchA || matchB;
  });

  const grouped = {
    high: flagged.filter((i) => i.severity === "high"),
    moderate: flagged.filter((i) => i.severity === "moderate"),
    low: flagged.filter((i) => i.severity === "low"),
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interaction check complete",
    data: {
      currentMedications: medications.map((m) => m.name),
      interactions: grouped,
    },
  });
});

export const getAllInteractions = catchAsync(async (req, res) => {
  const { severity, search } = req.query;

  const filter = {};
  if (severity && severity !== "All") filter.severity = severity.toLowerCase();
  if (search) {
    filter.$or = [
      { drugA: { $regex: search, $options: "i" } },
      { drugB: { $regex: search, $options: "i" } },
    ];
  }

  const interactions = await Interaction.find(filter).sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interactions fetched",
    data: interactions,
  });
});

export const createInteraction = catchAsync(async (req, res) => {
  const { drugA, drugB, severity, effect, recommendation, category } = req.body;

  if (!drugA || !drugB || !severity || !effect || !recommendation) {
    throw new AppError(httpStatus.BAD_REQUEST, "All fields are required");
  }

  const interaction = await Interaction.create({
    drugA,
    drugB,
    severity: severity.toLowerCase(),
    effect,
    recommendation,
    category,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Interaction created successfully",
    data: interaction,
  });
});

export const updateInteraction = catchAsync(async (req, res) => {
  const interaction = await Interaction.findById(req.params.id);

  if (!interaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Interaction not found");
  }

  const { drugA, drugB, severity, effect, recommendation, category } = req.body;

  if (drugA) interaction.drugA = drugA;
  if (drugB) interaction.drugB = drugB;
  if (severity) interaction.severity = severity.toLowerCase();
  if (effect) interaction.effect = effect;
  if (recommendation) interaction.recommendation = recommendation;
  if (category !== undefined) interaction.category = category;

  await interaction.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interaction updated successfully",
    data: interaction,
  });
});

export const deleteInteraction = catchAsync(async (req, res) => {
  const interaction = await Interaction.findByIdAndDelete(req.params.id);

  if (!interaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Interaction not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Interaction deleted successfully",
    data: null,
  });
});
