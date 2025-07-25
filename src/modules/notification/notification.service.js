import User from "../user/user.model.js";
import Notification from "./notification.model.js";

export const createNotification = async ({ title, message, receiverEmail }) => {
  const user = await User.findOne({ email: receiverEmail });
  if (!user) throw new Error("User not found");

  return await Notification.create({
    title,
    message,
    receiver: user._id,
  });
};

export const getNotificationsByUser = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  const warehouseId = user.assignedWarehouse;
  if (!user) throw new Error("User not found");

  if (!warehouseId) {
    return [];
  }

  return await Notification.find({ receiver: warehouseId }).sort({
    createdAt: -1,
  });
};

export const markNotificationAsRead = async (notificationId, userEmail) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");

  return await Notification.findOneAndUpdate(
    { _id: notificationId, receiver: user._id },
    { isRead: true },
    { new: true }
  );
};
export const markAllNotificationsAsRead = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");

  // Lấy warehouseId mà user làm việc tại
  const warehouseId = user.assignedWarehouse;

  // Update: thêm user._id vào readBy nếu chưa có
  return await Notification.updateMany(
    {
      receiver: warehouseId,
      readBy: { $ne: user._id }, // chưa đọc
    },
    {
      $addToSet: { readBy: user._id }, // thêm nếu chưa có
    }
  );
};
