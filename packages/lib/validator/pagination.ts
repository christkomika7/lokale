import { z } from "zod";

export const countryQuerySchema = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  continent: z.string().optional(),
  currencyId: z.string().optional(),
});
