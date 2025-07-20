import express from "express";
import * as warehouseController from "./warehouse.controller.js";
import { validateSchema } from "../main.middleware.js";
import { createWarehouse, updateWarehouse } from "./warehouse.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const router = express.Router();

// @route   GET /api/v1/warehouses
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  warehouseController.getWarehouses
);

// @route   GET /api/v1/warehouses/capacity
// Lấy capacity (admin xem tất cả, manager/staff chỉ xem kho mình)
router.get(
  "/capacity",
  authenticationMiddleware.verifyToken,
  warehouseController.getAllWarehouseCapacity
);
router.get(
  "/zones-capacity",
  authenticationMiddleware.verifyToken,
  warehouseController.getWarehousesWithZonesCapacity
);
router.get(
  "/my-warehouse/zones-capacity",
  authenticationMiddleware.verifyToken,
  warehouseController.getMyWarehouseWithZonesCapacity
);
// @route   GET /api/v1/warehouses/:id
// kiểm tra quyền trong service
router.get(
  "/:id",
  authenticationMiddleware.verifyToken,
  warehouseController.getWarehouseById
);

// @route   POST /api/v1/warehouses
router.post(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  validateSchema(createWarehouse),
  warehouseController.createWarehouse
);

// @route   PUT /api/v1/warehouses/:id
router.put(
  "/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  validateSchema(updateWarehouse),
  warehouseController.updateWarehouse
);

// @route   POST /api/v1/warehouses/:id/status
router.post(
  "/:id/status",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  warehouseController.changeWarehouseStatus
);
export default router;
