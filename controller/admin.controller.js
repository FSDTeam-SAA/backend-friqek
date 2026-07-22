import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import User from "../model/user.model.js";
import Medication from "../model/medication.model.js";
import Dose from "../model/dose.model.js";
import { getTodayKey } from "../utils/commonMethod.js";

// Screen: Admin Dashboard (top stat cards + Adherence bar chart + User Growth chart)
export const getDashboardStats = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
  const activePatients = await User.countDocuments({ role: "patient", isBlocked: false });
  const activeCaregivers = await User.countDocuments({ role: "caregiver", isBlocked: false });

  const dateKey = getTodayKey();
  const todayDoses = await Dose.find({ dateKey });
  const taken = todayDoses.filter((d) => d.status === "taken").length;
  const avgAdherence = todayDoses.length ? Math.round((taken / todayDoses.length) * 100) : 0;

  // Adherence bar chart - last 7 days
  const adherenceByDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getTodayKey(d);
    const doses = await Dose.find({ dateKey: key });
    const takenCount = doses.filter((x) => x.status === "taken").length;
    adherenceByDay.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      percentage: doses.length ? Math.round((takenCount / doses.length) * 100) : 0,
    });
  }

  // User growth - last 12 months
  const userGrowth = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
    userGrowth.push({ month: d.toLocaleDateString("en-US", { month: "short" }), count });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats fetched",
    data: {
      totalUsers,
      activePatients,
      activeCaregivers,
      avgAdherence,
      adherenceByDay,
      userGrowth,
    },
  });
});

// Screen: All Users (table with pagination)
export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 9, role, status, search } = req.query;

  const filter = { role: { $ne: "admin" } };
  if (role) filter.role = role;
  if (status) filter.isBlocked = status === "Inactive";
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched",
    data: users,
    meta: { page: Number(page), limit: Number(limit), total },
  });
});

// Screen: All Users -> "eye" icon (User Profile modal)
export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  let adherence = 0;
  if (user.role === "patient") {
    const dateKey = getTodayKey();
    const doses = await Dose.find({ user: user._id, dateKey });
    const taken = doses.filter((d) => d.status === "taken").length;
    adherence = doses.length ? Math.round((taken / doses.length) * 100) : 0;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched",
    data: { ...user.toJSON(), adherence },
  });
});

// Screen: All Users -> "check" icon (activate / toggle active-inactive)
export const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User marked as ${user.isBlocked ? "Inactive" : "Active"}`,
    data: user,
  });
});

// Screen: All Users -> "trash" icon (Confirm Action -> Delete)
export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  await Medication.deleteMany({ user: user._id });
  await Dose.deleteMany({ user: user._id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});
