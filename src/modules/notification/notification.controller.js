import * as notificationService from "./notification.service.js";

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, receiver } = req.body;
    const notification = await notificationService.createNotification({
      title,
      message,
      receiver,
    });

    res.status(201).json({
      isSuccess: true,
      message: "Notification created",
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

export const getNotificationsForUser = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const notifications = await notificationService.getNotificationsByUser(
      userEmail
    );

    res.status(200).json({
      isSuccess: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const email = req.user.email;


    const updated = await notificationService.markNotificationAsRead(
      notificationId,
      email
    );

    if (!updated) {
      return res.status(404).json({
        isSuccess: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      isSuccess: true,
      message: "Marked as read",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const email = req.user.email;
    await notificationService.markAllNotificationsAsRead(email);

    res.status(200).json({
      isSuccess: true,
      message: "Tất cả thông báo đã được đánh dấu là đã đọc",
    });
  } catch (err) {
    next(err);
  }
};
