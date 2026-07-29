import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import Plan from "../model/plan.model.js";
import Subscription from "../model/subscription.model.js";

// Screen: Subscription Plan (Monthly / Yearly toggle -> Personal/Premium cards)
export const getPlans = catchAsync(async (req, res) => {
  const { billingCycle = "monthly" } = req.query;

  const plans = await Plan.find({ billingCycle, isActive: true }).sort({ price: 1 });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plans fetched",
    data: plans,
  });
});

// Screen: My Profile -> "Subscription Plan -> Manage your plan and billing"
export const getMySubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: "active",
  }).populate("plan");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription fetched",
    data: subscription || null,
  });
});

// Screen: Subscription Plan -> "Subscribe" button
export const subscribeToPlan = catchAsync(async (req, res) => {
  const { planId } = req.body;

  if (!planId) {
    throw new AppError(httpStatus.BAD_REQUEST, "planId is required");
  }

  const plan = await Plan.findById(planId);

  if (!plan || !plan.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  }

  // deactivate any existing active subscription
  await Subscription.updateMany(
    { user: req.user._id, status: "active" },
    { status: "cancelled", endDate: new Date() }
  );

  const endDate = new Date();
  if (plan.billingCycle === "monthly") endDate.setMonth(endDate.getMonth() + 1);
  else endDate.setFullYear(endDate.getFullYear() + 1);

  const subscription = await Subscription.create({
    user: req.user._id,
    plan: plan._id,
    billingCycle: plan.billingCycle,
    status: "active",
    startDate: new Date(),
    endDate,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Subscribed to ${plan.name} (${plan.billingCycle}) successfully`,
    data: subscription,
  });
});

// Screen: Subscription Plan -> Cancel plan (Manage plan & billing)
export const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id, status: "active" });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, "No active subscription found");
  }

  subscription.status = "cancelled";
  subscription.endDate = new Date();
  await subscription.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});

// ---------------- Admin: manage plan catalog ----------------

export const createPlan = catchAsync(async (req, res) => {
  const { name, description, billingCycle, price, features, badge, isPopular } = req.body;

  if (!name || !billingCycle) {
    throw new AppError(httpStatus.BAD_REQUEST, "name and billingCycle are required");
  }

  const plan = await Plan.create({
    name,
    description,
    billingCycle,
    price: price || 0,
    features: features || [],
    badge,
    isPopular: !!isPopular,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Plan created successfully",
    data: plan,
  });
});

export const updatePlan = catchAsync(async (req, res) => {
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  }

  Object.assign(plan, req.body);
  await plan.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plan updated successfully",
    data: plan,
  });
});

export const deletePlan = catchAsync(async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);

  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plan deleted successfully",
    data: null,
  });
});