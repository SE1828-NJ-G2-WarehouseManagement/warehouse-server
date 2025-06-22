import { z } from "zod";

export const outboundOrderItem = z.object({
  zoneItem: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createOutboundOrder = z.object({
  customerId: z.string().min(1),
  signed: z.string().optional(),
  items: z.array(outboundOrderItem).min(1),
  quantity: z.number().int().positive(),
});
