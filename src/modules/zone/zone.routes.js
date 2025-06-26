import express from "express";
import * as zoneController from "./zone.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

import { validateSchema } from "../main.middleware.js";
import { createZone, updateZone } from "./zone.schema.js";

router.get(
  "/without-pagination",
  authenticationMiddleware.verifyToken,
  zoneController.getZoneWithoutPagination
);
router.get("/", authenticationMiddleware.verifyToken, zoneController.getZones);
router.get(
  "/capacity",
  authenticationMiddleware.verifyToken,
  zoneController.getZoneCapacity
);

router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  zoneController.getZoneById
);

router.post(
  "/",
  authenticationMiddleware.verifyToken,
  validateSchema(createZone),
  zoneController.createZone
);

router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  validateSchema(updateZone),
  zoneController.updateZone
);

router.post(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  zoneController.changeStatusZone
);

export default router;
