import express from "express";
import * as authenticationMiddleware from "../../main.middleware.js";
import * as reportController from "./report.controller.js";
import { ROLES } from "../../../constant/role.constant.js";


const reportRouter = express.Router();

// @route   GET /api/v1/admin/reports/
reportRouter.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.allowRoles(ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF),
  reportController.getReports
);


export default reportRouter;