import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import Notification from "../model/notification.model.js";

export const getNotifications = catchAsync(async (req, res) => {
  const { type } = req.query; 

  const filter = { recipient: req.user._id };
  if (type && type !== "All") filter.type = type.toLowerCase();

  const notifications = await Notification.find(filter)
    .populate("patient", "name")
    .sort({ createdAt: -1 });

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched",
    data: notifications,
    meta: { unreadCount, alertsToday: notifications.length },
  });
});

export const markNotificationRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { returnDocument: "after", }
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

export const markAllNotificationsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});
