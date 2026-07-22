import httpStatus from "http-status";
import { uploadOnCloudinary } from "../utils/commonMethod.js";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import User from "../model/user.model.js";
import CaregiverLink from "../model/caregiverLink.model.js";
import Medication from "../model/medication.model.js";
import Dose from "../model/dose.model.js";
import { getTodayKey } from "../utils/commonMethod.js";

// Screen: My Profile (top profile card + fields)
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  let meds = 0;
  let adherence = 0;

  if (user.role === "patient") {
    meds = await Medication.countDocuments({ user: user._id, isActive: true });

    const todayDoses = await Dose.find({ user: user._id, dateKey: getTodayKey() });
    const taken = todayDoses.filter((d) => d.status === "taken").length;
    adherence = todayDoses.length ? Math.round((taken / todayDoses.length) * 100) : 0;
  } else if (user.role === "caregiver") {
    meds = await CaregiverLink.countDocuments({ caregiver: user._id, status: "active" });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched",
    data: {
      ...user.toJSON(),
      meds,
      adherence,
      streak: user.currentStreakDays,
    },
  });
});

// Screen: My Profile -> Full Name / Age / Gender / Medical Conditions / Allergies (edit icons)
export const updateProfile = catchAsync(async (req, res) => {
  const {
    name,
    phoneNumber,
    age,
    gender,
    medicalConditions,
    allergies,
    emergencyContactName,
    emergencyContactRelation,
    emergencyContactPhone,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (name) user.name = name.trim();
  if (phoneNumber) user.phoneNumber = phoneNumber.trim();
  if (age !== undefined) user.age = age;
  if (gender) user.gender = gender;

  if (medicalConditions !== undefined) {
    user.medicalConditions = Array.isArray(medicalConditions)
      ? medicalConditions
      : String(medicalConditions)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
  }

  if (allergies !== undefined) {
    user.allergies = Array.isArray(allergies)
      ? allergies
      : String(allergies)
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
  }

  if (emergencyContactName || emergencyContactRelation || emergencyContactPhone) {
    user.emergencyContact = {
      name: emergencyContactName ?? user.emergencyContact?.name ?? "",
      relation: emergencyContactRelation ?? user.emergencyContact?.relation ?? "",
      phone: emergencyContactPhone ?? user.emergencyContact?.phone ?? "",
    };
  }

  if (req.file) {
    const upload = await uploadOnCloudinary(req.file.buffer);
    user.profileImage = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  }

  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// Screen: Account Management -> Change Password
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current password, new password and confirm password are required"
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Passwords don't match");
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current password and new password cannot be same"
    );
  }

  if (String(newPassword).length < 6) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password must be at least 6 characters"
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatched = await user.comparePassword(currentPassword);

  if (!isMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

// Screen: Account Management -> Delete Account
export const deleteAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;

  await Medication.deleteMany({ user: userId });
  await Dose.deleteMany({ user: userId });
  await CaregiverLink.deleteMany({ $or: [{ patient: userId }, { caregiver: userId }] });
  await User.findByIdAndDelete(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account deleted successfully",
    data: null,
  });
});
