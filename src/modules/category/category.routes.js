import express from "express";
import * as categoryController from "./category.controller.js";
import { validateSchema } from "../main.middleware.js";
import { createCategory, updateCategory } from "./category.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

// @route   GET /api/v1/categories
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  categoryController.getCategories
);

router.get(
  "/active",
  authenticationMiddleware.verifyToken,
  categoryController.getActiveCategories
);

// @route   GET /api/v1/categories/filter
router.get(
  "/filter",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF, ROLES.WAREHOUSE_MANAGER),
  categoryController.filterCategoriesByName 
);

// @route   GET /api/v1/categories/:id
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  categoryController.getCategoryById
);

// @route   POST /api/v1/categories
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(createCategory),
  categoryController.createCategory
);

// @route   PUT /api/v1/categories/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(updateCategory),
  categoryController.updateCategory
);

// @route   POST /api/v1/categories/:id/status
router.put(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  categoryController.changeCategoryStatus
);

router.put(
  "/approve/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  categoryController.approveCategory
);

// @route   PUT /api/v1/categories/reject/:id
router.put(
  "/reject/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  categoryController.rejectCategory
);

export default router;
