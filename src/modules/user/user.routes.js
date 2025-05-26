import express from "express";
import { sayHello } from "./user.controller.js";
import { validateSchema } from "../main.middleware.js";
import { createUser } from "./user.schema.js";

const userRouter = express.Router();


// @route   GET /api/users
// @desc    Get message
userRouter.post('/', validateSchema(createUser), sayHello);

export default userRouter;