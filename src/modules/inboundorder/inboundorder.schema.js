import { z } from "zod";


export const inboundOrderItem = z.object({
  productId: z.string().min(1),
  weights: z.number().positive(),
  expiredDate: z.string().refine((d) => new Date(d) > new Date(), {
    message: "expiredDate must be in the future",
  }),
  quantity: z.number().int().positive(),
});


export const createInboundOrder = z.object({
  zoneId: z.string().min(1),
  supplierId: z.string().min(1),
  items: z.array(inboundOrderItem).min(1),
});
