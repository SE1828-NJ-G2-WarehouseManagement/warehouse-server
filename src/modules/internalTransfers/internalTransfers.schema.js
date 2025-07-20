import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// Schema cho tạo mới
export const createInternalTransfer = z
  .object({
    items: z
      .array(
        z
          .object({
            zoneItemId: objectIdSchema,
            quantity: z
              .number({
                required_error: "Quantity is required",
              })
              .int("Quantity must be an integer")
              .min(1, "Quantity must be at least 1"),
          })
          .strict()
      )
      .min(1, "At least one item is required")
      .max(50, "Maximum 50 items allowed"),
    receiver: z
      .object({
        warehouseId: objectIdSchema,
      })
      .strict(),
  })
  .strict();

// Schema cho cập nhật
export const updateInternalTransfer = z
  .object({
    items: z
      .array(
        z
          .object({
            zoneItemId: objectIdSchema,
            quantity: z
              .number()
              .int("Quantity must be an integer")
              .min(1, "Quantity must be at least 1"),
          })
          .strict()
      )
      .min(1, "At least one item is required")
      .max(50, "Maximum 50 items allowed")
      .optional(),
    receiver: z
      .object({
        warehouseId: objectIdSchema.optional(),
        zoneId: objectIdSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const approveInternalTransfer = z
  .object({
    rejectedNote: z.string().optional(),
  })
  .strict();

export const rejectInternalTransfer = z
  .object({
    rejectedNote: z
      .string({
        required_error: "Rejected note is required when rejecting",
      })
      .min(1, "Rejected note cannot be empty")
      .max(500, "Rejected note cannot exceed 500 characters"),
  })
  .strict();
