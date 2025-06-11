import { z } from "zod";

const warehouseBase = z
  .object({
    name: z.string().min(1, "Warehouse name is required"),
    address: z.string().min(1, "Warehouse address is required"),
    totalCapacity: z.number().min(1, "Total capacity must be greater than 0"),
    manageBy: z.string().optional(),
    staffs: z.array(z.string()).optional(),
  })
  .strict();

export const createWarehouse = warehouseBase;

export const updateWarehouse = warehouseBase.partial();
