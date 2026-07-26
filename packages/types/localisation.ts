import { z } from "zod";
import {
  countrySchema,
  citySchema,
  currencySchema,
} from "../lib/validator/localisation";

export type Continent =
  | "Afrique"
  | "Europe"
  | "Amérique du Nord"
  | "Amérique du Sud"
  | "Asie"
  | "Océanie";

export type CountrySchemaType = z.infer<typeof countrySchema>;
export type CitySchemaType = z.infer<typeof citySchema>;
export type CurrencySchemaType = z.infer<typeof currencySchema>;

export interface Currency extends CurrencySchemaType {
  id: string;
  _count?: { countries: number };
}

export interface City extends CitySchemaType {
  id: string;
  countryId: string;
}

export interface Country extends CountrySchemaType {
  id: string;
  currency: Currency;
  cities: City[];
  _count?: { cities: number };
}
