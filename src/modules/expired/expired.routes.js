import express from "express";
const router = express.Router();
import * as authenticationMiddleware from "../main.middleware.js";
import * as expiredController from "./expired.controller.js";

router.get("/expiring-soon", expiredController.getAllExpiringSoon);

router.get(
  "/expired-product",
  authenticationMiddleware.verifyToken,
  expiredController.getExpiredProducts
);

export default router;
