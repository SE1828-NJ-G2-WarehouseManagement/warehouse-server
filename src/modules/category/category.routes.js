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
router.post(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  categoryController.changeCategoryStatus
);

export default router;
