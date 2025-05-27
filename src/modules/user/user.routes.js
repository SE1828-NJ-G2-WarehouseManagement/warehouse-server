import express from "express";
import { login, register, sayHello } from "./user.controller.js";
import { validateSchema } from "../main.middleware.js";
import { registerUser, loginUser } from "./user.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";

const userRouter = express.Router();


// @route   POST /api/v1/users
// @desc    Register user
userRouter.post('/register', validateSchema(registerUser), register);

// @route   POST /api/v1/users
// @desc    Login user
userRouter.post('/login', validateSchema(loginUser), login);

userRouter.get(
    '/get-protected-route', 
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(ROLES.WAREHOUSE_MANAGER), 
    sayHello
);



export default userRouter;