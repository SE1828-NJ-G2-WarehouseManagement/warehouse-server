  import express from "express";
  import { changePassword, login, register, resetPassword, verifyOtp } from "./user.controller.js";
  import { validateSchema } from "../main.middleware.js";
  import { registerUser, loginUser, resetPasswordUser, verifyOtpUser, changePasswordUser } from "./user.schema.js";
  import * as authenticationMiddleware from "../main.middleware.js";
  import { ROLES } from "../../constant/role.constant.js";

  const userRouter = express.Router();

  // @route   POST /api/v1/users/register
  // @desc    Register user
  userRouter.post("/register", validateSchema(registerUser), register);

  // @route   POST /api/v1/users/login
  // @desc    Login user
  userRouter.post("/login", validateSchema(loginUser), login);

  // @route   POST /api/v1/users/reset-password
  // @desc    reset password
  userRouter.post(
    "/reset-password",
    validateSchema(resetPasswordUser),
    resetPassword
  );

  // @route   POST /api/v1/users/verify-otp
  // @desc    verify otp
  userRouter.post(
    "/verify-otp",
    validateSchema(verifyOtpUser),
    verifyOtp
  );

  // @route   POST /api/v1/users/change-password
  // @desc    verify otp
  userRouter.post(
    "/change-password",
    validateSchema(changePasswordUser),
    changePassword
  );


  export default userRouter;
