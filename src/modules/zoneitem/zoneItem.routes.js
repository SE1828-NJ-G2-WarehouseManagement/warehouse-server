import express from "express";
import * as zoneItemController from "./zoneItem.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";

const router = express.Router();

router.get("/:zoneId/items", authenticationMiddleware.verifyToken, zoneItemController.getItemByZoneId);

export default router;
