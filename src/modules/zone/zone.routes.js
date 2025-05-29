import express from "express";
import * as zoneController from "./zone.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

router.get("/", authenticationMiddleware.verifyToken, zoneController.getZones);
router.get(
  "/capacity",
  authenticationMiddleware.verifyToken,
  zoneController.getZoneCapacity
);

export default router;
