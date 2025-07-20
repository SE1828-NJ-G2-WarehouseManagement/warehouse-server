import express from "express";
import * as internalTransferController from "./internalTransfers.controller.js";
import { validateSchema } from "../main.middleware.js";
import {
  createInternalTransfer,
  updateInternalTransfer,
  approveInternalTransfer,
  rejectInternalTransfer,
} from "./internalTransfers.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

// @route   GET /api/v1/internal-transfers
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  internalTransferController.getInternalTransfers
);

// @route   GET /api/v1/internal-transfers/:id
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  internalTransferController.getInternalTransferById
);

// @route   POST /api/v1/internal-transfers
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(createInternalTransfer),
  internalTransferController.createInternalTransfer
);

// @route   PUT /api/v1/internal-transfers/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(updateInternalTransfer),
  internalTransferController.updateInternalTransfer
);

// @route   PUT /api/v1/internal-transfers/:id/approve
router.put(
  "/:id/approve",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  validateSchema(approveInternalTransfer),
  internalTransferController.approveInternalTransfer
);

// @route   PUT /api/v1/internal-transfers/:id/reject
router.put(
  "/:id/reject",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  validateSchema(rejectInternalTransfer),
  internalTransferController.rejectInternalTransfer
);

export default router;
