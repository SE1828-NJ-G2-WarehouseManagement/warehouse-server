import express from "express";
import * as supplierController from "./supplier.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";
import { validateSchema } from "../main.middleware.js";
import { createSupplier } from "./supplier.schema.js";
const router = express.Router();
// @route   GET /api/v1/suppliers
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  supplierController.getListSuppliers
);

// @route   GET /api/v1/suppliers/pending
router.get(
  "/pending",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  supplierController.getListSuppliersPending
);

// @route   GET /api/v1/suppliers/:id
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  supplierController.getSupplierById
);

// @route   POST /api/v1/suppliers
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(createSupplier),
  supplierController.createSupplier
);

export default router;
