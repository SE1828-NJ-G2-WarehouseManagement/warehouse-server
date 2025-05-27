import { z } from "zod";
import { ROLES } from "../../constant/role.constant.js";

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
  

export { registerUser, loginUser };
