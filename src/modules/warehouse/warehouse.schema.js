import { z } from "zod";

const warehouseBase = z
  .object({
    name: z.string().min(1, "Warehouse name is required"),
    address: z.string().min(1, "Warehouse address is required"),
    totalCapacity: z.number().min(1, "Total capacity must be greater than 0"),
    currentCapacity: z
      .number()
      .min(0, "Current capacity cannot be negative")
      .default(0),
    manageBy: z.string().optional(),
    staffs: z.array(z.string()).optional(),
  })
  .strict();

export const createWarehouse = warehouseBase.refine(
  (data) => data.currentCapacity <= data.totalCapacity,
  {
    message: "Current capacity cannot exceed total capacity",
    path: ["currentCapacity"],
  }
);

export const updateWarehouse = warehouseBase
  .partial()
  .refine(
    (data) =>
      data.currentCapacity === undefined ||
      data.totalCapacity === undefined ||
      data.currentCapacity <= data.totalCapacity,
    {
      message: "Current capacity cannot exceed total capacity",
      path: ["currentCapacity"],
    }
  );
