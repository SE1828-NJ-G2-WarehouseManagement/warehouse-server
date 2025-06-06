import express from "express";
import * as productController from "./product.controller.js";
import { validateSchema } from "../main.middleware.js";
import { createProduct, updateProduct } from "./product.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

// @route   GET /api/v1/products
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  productController.getProducts
);

// @route   GET /api/v1/products/:id
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  productController.getProductById
);

// @route   POST /api/v1/products
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(createProduct),
  productController.createProduct
);

// @route   PUT /api/v1/products/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  validateSchema(updateProduct),
  productController.updateProduct
);

// @route   POST /api/v1/products/:id/status
router.post(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  productController.changeProductStatus
);

export default router;
