import express from "express";
import * as productController from "./product.controller.js";
import { validateSchema } from "../main.middleware.js";
import { createProduct, updateProduct } from "./product.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";
import { uploadProductImage } from "../../config/cloudinary.js";

const router = express.Router();

// @route   GET /api/v1/products
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  productController.getProducts
);

router.post(
  "/upload-image",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  uploadProductImage.single("image"),
  productController.uploadProductImage
);

router.get(
  "/active",
  authenticationMiddleware.verifyToken,
  productController.getActiveProducts
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
  // parseStorageTemperature,
  validateSchema(createProduct),
  productController.createProduct
);

// @route   PUT /api/v1/products/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_STAFF),
  // parseStorageTemperature,
  validateSchema(updateProduct),
  productController.updateProduct
);

// @route   POST /api/v1/products/:id/status
router.put(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  productController.changeProductAction
);

// @route   PUT /api/v1/product/approve/:id
router.put(
  "/approve/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  productController.approveProduct
);

// @route   PUT /api/v1/product/reject/:id
router.put(
  "/reject/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER),
  productController.rejectProduct
);

export default router;
