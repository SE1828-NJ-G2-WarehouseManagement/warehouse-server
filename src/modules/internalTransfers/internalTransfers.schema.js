import { z } from "zod";
import { STATUS } from "../../constant/status.constant.js";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

const internalTransferBase = z
  .object({
    sourceWarehouseId: objectIdSchema,
    zoneItemId: objectIdSchema,
    receiver: z
      .object({
        warehouseId: objectIdSchema,
        zoneId: objectIdSchema,
      })
      .strict(),
    quantity: z
      .number({
        required_error: "Quantity is required",
      })
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1"),
    reason: z
      .string({
        required_error: "Reason is required",
      })
      .min(1, "Reason cannot be empty")
      .max(500, "Reason cannot exceed 500 characters"),
    status: z
      .enum([STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED])
      .default(STATUS.PENDING),
    rejectedNote: z.string().optional(),
  })
  .strict()
  .refine((data) => data.sourceWarehouseId !== data.receiver.warehouseId, {
    message: "Source warehouse and destination warehouse must be different",
    path: ["receiver", "warehouseId"],
  });

export const createInternalTransfer = internalTransferBase.omit({
  status: true,
  rejectedNote: true,
});

export const updateInternalTransfer = internalTransferBase
  .omit({
    sourceWarehouseId: true,
    zoneItemId: true,
    status: true,
    rejectedNote: true,
  })
  .partial();

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
