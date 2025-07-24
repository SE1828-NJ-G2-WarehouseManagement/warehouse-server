import express from "express";
import * as notificationController from "./notification.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const notificationRouter = express.Router();

notificationRouter.post(
  "/",
  authenticationMiddleware.verifyToken,
  notificationController.createNotification
);

notificationRouter.get(
  "/",
  authenticationMiddleware.verifyToken,
  notificationController.getNotificationsForUser
);

notificationRouter.put(
  "/:id/read",
  authenticationMiddleware.verifyToken,
  notificationController.markAsRead
);

notificationRouter.put(
  "/mark-all-read",
  authenticationMiddleware.verifyToken,
  notificationController.markAllAsRead
);

export default notificationRouter;
