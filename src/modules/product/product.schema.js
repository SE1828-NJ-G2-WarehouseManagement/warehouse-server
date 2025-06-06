import { z } from "zod";

const productBase = z
  .object({
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    density: z
      .number()
      .optional()
      .refine((val) => val === undefined || val > 0, {
        message: "Density must be greater than 0",
      }),
    storageTemperature: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }),
    reason: z.string().optional(),
    image: z.string().optional(),
  })
  .strict();

export const createProduct = productBase;

export const updateProduct = productBase.partial();
