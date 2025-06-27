import express from "express";
import {
  createCustomerController,
  getCustomerByIdController,
  updateCustomerController,
  getAllCustomersController,
  searchCustomersController,
  filterCustomersByStatusController,
  changeCustomerStatusController,
  getAllCustomersNoPaginationController
} from "./customer.controller.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.schema.js";

import { validateSchema } from "../main.middleware.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

// @route   POST /api/v1/customers/new-customer
// @desc    Create new customer
router.post(
  "/new-customer",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  validateSchema(createCustomerSchema),
  createCustomerController
);

// @route   GET /api/v1/customers
// @desc    Get all customers with pagination and optional status filter
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  getAllCustomersController
);

// @route   GET /api/v1/customers/all
// @desc    Get all customers with no pagination
router.get(
  "/all",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  getAllCustomersNoPaginationController
);

// @route   GET /api/v1/customers/search
// @desc    Search customers by query
router.get(
  "/search",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  searchCustomersController
);

// @route   GET /api/v1/customers/filter
// @desc    Filter customers by status
router.get(
  "/filter",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  filterCustomersByStatusController
);

// @route   GET /api/v1/customers/:id
// @desc    Get customer by ID
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  getCustomerByIdController
);

// @route   PUT /api/v1/customers/:id
// @desc    Update customer by ID
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  validateSchema(updateCustomerSchema),
  updateCustomerController
);

// @route   PATCH /api/v1/customers/:id/status
// @desc    Change customer status by ID
router.patch(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_STAFF),
  changeCustomerStatusController
);

export default router;
