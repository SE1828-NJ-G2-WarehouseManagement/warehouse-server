import { z } from "zod";

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const transferBetweenZone = z.object({
  sourceZoneId: objectId,
  destinationZoneId: objectId,
  itemId: objectId,
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int()
    .positive("Quantity must be greater than 0"),
});
