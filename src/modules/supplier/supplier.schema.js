import { z } from "zod";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";
const supplierBase = z
  .object({
    name: z.string().min(1, "Supplier name is required"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .regex(/^\d{10,15}$/, "Phone number must be 10–15 digits"),
    email: z.string().email("Invalid email format").optional(),
    address: z.string().min(1, "Address is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    status: z
      .enum([STATUS.ACTIVE, STATUS.PENDING, STATUS.INACTIVE, STATUS.REJECTED])
      .default(STATUS.PENDING),
    action: z.enum([ACTION.ACTIVE, ACTION.INACTIVE]).default(ACTION.INACTIVE),
  })
  .strict();

export const createSupplier = supplierBase;
export const updateSupplier = supplierBase.partial();
