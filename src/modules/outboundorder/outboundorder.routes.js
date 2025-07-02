import express from "express";
import * as outboundOrderController from "./outboundorder.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { validateSchema } from "../main.middleware.js";
import { createOutboundOrder } from "./outboundorder.schema.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

router.post(
  "/",
  authenticationMiddleware.verifyToken,
  validateSchema(createOutboundOrder),
  outboundOrderController.createOutboundOrder
);

router.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  outboundOrderController.getListOutboundOrder
);
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  outboundOrderController.getOutboundOrderById
);

export default router;

