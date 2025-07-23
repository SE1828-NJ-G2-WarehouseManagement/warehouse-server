import express from "express";
const router = express.Router();
import * as expiredController from "./expired.controller.js";

router.get("/expiring-soon", expiredController.getAllExpiringSoon);

router.get("/expired-product", expiredController.getExpiredProducts);

export default router;
