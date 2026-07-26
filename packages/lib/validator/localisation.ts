import { z } from "zod";

export const CityEnum = z.enum(
  [
    "CAPITAL",
    "METROPOLIS",
    "CITY",
    "TOWN",
    "VILLAGE",
    "HAMLET",
    "SUBURB",
    "INDUSTRIAL_ZONE",
    "COMMERCIAL_ZONE",
    "TOURIST_AREA",
    "PORT_CITY",
    "BORDER_CITY",
  ],
  { error: "Le type de ville est invalide." },
);

export type CityType = z.infer<typeof CityEnum>;

export const countrySchema = z.object({
  name: z
    .string({ error: "Le nom est invalide." })
    .min(1, {
      error: "Le nom est requis.",
    })
    .trim(),
  code: z
    .string({ error: "Le code du pays est invalide." })
    .min(1, {
      error: "Le code du pays est requis.",
    })
    .trim(),
  phoneCode: z
    .string({ error: "Le code du téléphone du pays est invalide." })
    .min(1, {
      error: "Le code du téléphone du pays est requis.",
    })
    .trim(),
  continent: z
    .string({ error: "Le continent est invalide." })
    .min(1, {
      error: "Le continent est requis.",
    })
    .trim(),
  currencyId: z
    .string({ error: "Le type de monnaie est invalide." })
    .min(1, {
      error: "Le type de monnaie est requis.",
    })
    .trim(),
});

export const citySchema = z.object({
  name: z
    .string({ error: "Le nom du pays est invalide." })
    .min(1, {
      error: "Le nom du pays est requis.",
    })
    .trim(),
  region: z
    .string({ error: "La région est invalide." })
    .min(1, {
      error: "La région est requise.",
    })
    .trim(),
  type: CityEnum,
  population: z.number().optional(),
});

export const currencySchema = z.object({
  name: z
    .string({ error: "Le nom est invalide." })
    .min(1, {
      error: "Le nom est requis.",
    })
    .trim(),
  code: z
    .string({ error: "Le code  est invalide." })
    .min(1, {
      error: "Le code est requis.",
    })
    .trim(),
  symbol: z
    .string({ error: "Le symbole est invalide." })
    .min(1, {
      error: "Le symbole est requis.",
    })
    .trim(),
});
