import express from "express";
import {
  changePassword,
  changePasswordSetting,
  deleteUserByEmail,
  getAllManagerAvailable,
  getAllStaffAvailable,
  getAllUser,
  login,
  register,
  resetPassword,
  updateProfile,
  verifyOtp,
  viewProfile,
} from "./user.controller.js";
import { validateSchema } from "../main.middleware.js";
import {
  registerUser,
  loginUser,
  resetPasswordUser,
  verifyOtpUser,
  changePasswordUser,
  updateProfileUser,
  changePasswordForm,
} from "./user.schema.js";
import * as authenticationMiddleware from "../main.middleware.js";
import { ROLES } from "../../constant/role.constant.js";
import { upload } from "../../config/cloudinary.js";

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
userRouter.post("/verify-otp", validateSchema(verifyOtpUser), verifyOtp);

// @route   POST /api/v1/users/change-password
// @desc    change password
userRouter.post(
  "/change-password",
  validateSchema(changePasswordUser),
  changePassword
);

// @route   GET /api/v1/users/change-password-setting
// @desc    change password user
userRouter.post(
  "/change-password-setting",
  validateSchema(changePasswordForm),
  changePasswordSetting
);

// @route   GET /api/v1/users/view-profile
// @desc    view profile
userRouter.get(
  "/view-profile",
  authenticationMiddleware.verifyToken,
  viewProfile
);

// @route   GET /api/v1/users/
// @desc    list user
userRouter.get(
  "/",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  getAllUser
);

// @route   GET /api/v1/users/get-manager-available
// @desc    list manager available
userRouter.get(
  "/get-manager-available",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  getAllManagerAvailable
);

// @route   GET /api/v1/users/get-staff-available
// @desc    list staff available
userRouter.get(
  "/get-staff-available",
  getAllStaffAvailable
);

// @route   PUT /api/v1/users/update-profile
// @desc    update profile
userRouter.put(
  "/update-profile",
  authenticationMiddleware.verifyToken,
  upload.single('avatar'),
  validateSchema(updateProfileUser),
  updateProfile
);

// @route   DELETE /api/v1/users/delete-user-by-email
// @desc    delete user by email
userRouter.delete(
  "/delete-user-by-email",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(ROLES.ADMIN_WAREHOUSE),
  deleteUserByEmail
);

export default userRouter;
