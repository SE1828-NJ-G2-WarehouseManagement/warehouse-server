import express from "express";
import { sayHello } from "./user.controller.js";

const userRouter = express.Router();


// @route   GET /api/users
// @desc    Get message
userRouter.get('/', sayHello);

export default userRouter;