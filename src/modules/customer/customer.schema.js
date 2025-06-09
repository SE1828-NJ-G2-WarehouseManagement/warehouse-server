import { z } from "zod";
import { STATUS } from "../../constant/status.constant.js";

const baseCustomerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }).min(1, "Name cannot be empty"),

  phone: z.string({
    required_error: "Phone is required",
  }).regex(/^\d{10}$/, "Phone must be exactly 10 digits"),

  address: z.string({
    required_error: "Address is required",
  }).min(1, "Address cannot be empty"),

  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]).default(STATUS.ACTIVE),
}).strict();

export const updateCustomerSchema = baseCustomerSchema.partial()

export const createCustomerSchema = baseCustomerSchema;
