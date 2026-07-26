import { z } from "zod";
import { systemSchema } from "../lib/validator/admin";

export interface System {
  id: string;
  maintenance: boolean;
  googleAuth: boolean;
  rateLimit: number;
  uploadLimit: number;
  sms: boolean;
  whatsapp: boolean;
  facebook: boolean;
  instagram: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SystemSchemaType = z.infer<typeof systemSchema>;
