import express from "express";
import * as authenticationMiddleware from "../../main.middleware.js";
import * as adminController from "./admin.report.controller.js";
import { ROLES } from "../../../constant/role.constant.js";


const adminRouter = express.Router();

// @route   GET /api/v1/admin/reports/
adminRouter.get(
  "/reports",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  adminController.reports
);


export default adminRouter;