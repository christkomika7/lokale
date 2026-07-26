import { z } from "zod";

export const systemSchema = z
  .object({
    maintenance: z.boolean(),
    googleAuth: z.boolean(),
    rateLimit: z.number().int().min(1),
    uploadLimit: z.number().int().min(1),
    sms: z.boolean(),
    whatsapp: z.boolean(),
    facebook: z.boolean(),
    instagram: z.boolean(),
  })
  .partial();
