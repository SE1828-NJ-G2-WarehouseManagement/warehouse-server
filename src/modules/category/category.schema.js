import { z } from "zod";

const categoryBase = z
  .object({
    name: z.string().min(1, "Category name is required"),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "REJECTED"]).optional(),
    reason: z.string().optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  })
  .strict();

export const createCategory = categoryBase;

export const updateCategory = categoryBase.partial();