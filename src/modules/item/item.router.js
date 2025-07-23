import express from "express";
import * as itemController from "./item.controller.js";
import * as authenticationMiddleware from "../main.middleware.js";

const router = express.Router();

// GET /api/v1/items?productId=xxx
router.get(
  "/",
  authenticationMiddleware.verifyToken,
  itemController.getItemsByProductId
);
router.get(
  "/my-warehouse",
  authenticationMiddleware.verifyToken,
  itemController.getItemsInMyWarehouse
);
export default router;
