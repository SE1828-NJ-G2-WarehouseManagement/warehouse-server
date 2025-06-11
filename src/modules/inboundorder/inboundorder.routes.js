import express from "express";
import * as inboundOrderController from "./inboundorder.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { validateSchema } from "../main.middleware.js";
import { createInboundOrder } from "./inboundorder.schema.js";
import { ROLES } from "../../constant/role.constant.js";
const router = express.Router();

// tạo phiếu nhập kho
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  validateSchema(createInboundOrder),
  inboundOrderController.createInboundOrder
);

// xem phiếu nhập
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  inboundOrderController.getListInboundOrder
);

export default router;
