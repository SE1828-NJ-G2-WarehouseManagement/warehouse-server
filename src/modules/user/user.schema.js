import { z } from "zod";
import { ROLES } from "../../constant/role.constant.js";
import { email } from "zod/v4";

const registerUser = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([
    ROLES.ADMIN_WAREHOUSE,
    ROLES.WAREHOUSE_MANAGER,
    ROLES.WAREHOUSE_STAFF,
  ]),
});

const loginUser = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const resetPasswordUser = z.object({
  email: z.string().email(),
});

const verifyOtpUser = z.object({
  otp: z.string().nonempty(),
  email: z.string().email(),
});

const changePasswordUser = z.object({
  newPassword: z.string().nonempty(),
  email: z.string().email(),
});

const changePasswordForm = z.object({
  currentPassword: z.string().nonempty(),
  newPassword: z.string().nonempty(),
  email: z.string().email(),
});

const updateProfileUser = z.object({
  username: z.string().min(3).max(30).optional(),
  phone: z.string().regex(/^\d{9,11}$/, {
    message: "Phone number must be between 9 and 11 digits"
  }).nullable().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export {
  registerUser,
  loginUser,
  resetPasswordUser,
  verifyOtpUser,
  changePasswordUser,
  updateProfileUser,
  changePasswordForm
};
