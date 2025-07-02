import express from "express";
import * as zoneItemController from "./zoneItem.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { validateSchema } from "../main.middleware.js";
import { transferBetweenZone } from "../zoneitem/zoneItem.schema.js";
const router = express.Router();

router.get(
  "/:zoneId/items",
  authenticationMiddleware.verifyToken,
  zoneItemController.getItemByZoneId
);
router.post(
  "/transferZone",
  authenticationMiddleware.verifyToken,
  validateSchema(transferBetweenZone),
  zoneItemController.transferBetweenZone
);

router.get(
  "/products/active-in-zones",
  authenticationMiddleware.verifyToken,
  zoneItemController.getAllActiveProductsInZones
);

router.get(
  "/products/in-zones",
  authenticationMiddleware.verifyToken,
  zoneItemController.getAllProductsInZones
);

export default router;
