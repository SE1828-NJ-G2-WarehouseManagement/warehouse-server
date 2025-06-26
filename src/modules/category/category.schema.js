import { z } from "zod";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";

const categoryBase = z
  .object({
    name: z.string().min(1, "Category name is required"),
    reason: z.string().optional(),
    status: z
      .enum([STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED])
      .default(STATUS.PENDING),
    action: z.enum([ACTION.ACTIVE, ACTION.INACTIVE]).default(ACTION.INACTIVE),
  })
  .strict();

export const createCategory = categoryBase;
export const updateCategory = categoryBase.partial();
