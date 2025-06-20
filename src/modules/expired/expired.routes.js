import express from "express";
const router = express.Router();
import * as expiredController from "./expired.controller.js";

router.get("/expiring-soon", expiredController.getAllExpiringSoon);

export default router;
