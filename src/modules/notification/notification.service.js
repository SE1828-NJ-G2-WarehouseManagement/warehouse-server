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
  if (!user) throw new Error("User not found");

  return await Notification.find({ receiver: user._id }).sort({ createdAt: -1 });
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

  return await Notification.updateMany(
    { receiver: user._id, isRead: false },
    { $set: { isRead: true } }
  );
};
