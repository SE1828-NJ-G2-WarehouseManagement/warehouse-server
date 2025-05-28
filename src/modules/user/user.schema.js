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
  email: z.string().email()
});

export { registerUser, loginUser, resetPasswordUser, verifyOtpUser };
