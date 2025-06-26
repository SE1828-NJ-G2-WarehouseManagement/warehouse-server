import express from "express";
import * as supplierController from "./supplier.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";
import { validateSchema } from "../main.middleware.js";
import { createSupplier } from "./supplier.schema.js";
const router = express.Router();

router.get(
  "/all",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF
  ),
  supplierController.getAllSuppliersActive
);
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

// @route   PUT /api/v1/suppliers/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  supplierController.updateSupplier
);

// @route   PUT /api/v1/suppliers/approve/:id
router.put(
  "/approve/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_MANAGER),
  supplierController.approveSupplier
);
// @route   PUT /api/v1/suppliers/reject/:id
router.put(
  "/reject/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_MANAGER),
  supplierController.rejectSupplier
);

export default router;
