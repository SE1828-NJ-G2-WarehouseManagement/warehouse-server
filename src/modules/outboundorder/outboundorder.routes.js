import express from "express";
import * as outboundOrderController from "./outboundorder.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { validateSchema } from "../main.middleware.js";
import { createOutboundOrder } from "./outboundorder.schema.js";
const router = express.Router();

router.post(
  "/",
  authenticationMiddleware.verifyToken,
  validateSchema(createOutboundOrder),
  outboundOrderController.createOutboundOrder
);

export default router;
