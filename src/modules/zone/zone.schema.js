import { z } from "zod";

export const createZone = z
  .object({
    name: z.string().min(1, "Zone name is required"),
    totalCapacity: z
      .number({
        required_error: "Total capacity is required",
      })
      .min(1, "Total capacity must be greater than 0"),
    storageTemperature: z
      .object({
        min: z.number({
          required_error: "Minimum storage temperature is required",
        }),
        max: z.number({
          required_error: "Maximum storage temperature is required",
        }),
      })
      .refine((data) => data.min < data.max, {
        message:
          "Minimum storage temperature must be less than maximum storage temperature",
      }),
  })
  .strict();

export const updateZone = z
  .object({
    name: z.string().min(1, "Zone name is required").optional(),
    totalCapacity: z
      .number()
      .min(1, "Total capacity must be greater than 0")
      .optional(),
    storageTemperature: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .refine((data) => data.min < data.max, {
        message:
          "Minimum storage temperature must be less than maximum storage temperature",
      })
      .optional(),
  })
  .strict();
