import express from "express";
import * as supplierController from "./supplier.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

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

export default router;
