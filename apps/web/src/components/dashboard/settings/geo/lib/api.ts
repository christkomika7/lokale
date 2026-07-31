import { useApiMutation } from "#/hook/use-api-mutation";
import { useApiQuery } from "#/hook/use-api-query";

import type {
  Currency,
  CurrencySchemaType,
  Country,
  CountrySchemaType,
  City,
  CitySchemaType,
} from "@lokale/types/localisation";
import type { PaginatedResult } from "@lokale/types/pagination";

interface GetCountriesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  continent?: string;
  currencyId?: string;
  [key: string]: string | number | boolean | undefined | null;
}

interface GetCitiesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  countryId?: string;
  type?: string;
  [key: string]: string | number | boolean | undefined | null;
}

interface GetCurrenciesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined | null;
}

export const api = {
  // ─── Currencies ───────────────────────────────────────────────────────────
  getCurrencies: (params?: GetCurrenciesParams) =>
    useApiQuery<PaginatedResult<Currency>>(
      ["currencies", params],
      "/admin/currencies",
      { params },
    ),

  getCurrency: (id: string) =>
    useApiQuery<Currency>(["currencies", id], `/admin/currencies/${id}`),

  createCurrency: () =>
    useApiMutation<Currency, CurrencySchemaType>("/admin/currencies", {
      method: "post",
      invalidate: ["currencies"],
      successMessage: "Devise ajoutée",
    }),

  updateCurrency: (id: string) =>
    useApiMutation<Currency, Partial<CurrencySchemaType>>(
      `/admin/currencies/${id}`,
      {
        method: "patch",
        invalidate: ["currencies", "countries"],
        successMessage: "Devise mise à jour",
      },
    ),

  deleteCurrency: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/currencies/${id}`, {
      method: "delete",
      invalidate: ["currencies"],
      successMessage: "Devise supprimée",
    }),

  // ─── Countries ────────────────────────────────────────────────────────────
  getCountries: (params?: GetCountriesParams) =>
    useApiQuery<PaginatedResult<Country>>(
      ["countries", params],
      "/admin/countries",
      { params },
    ),

  getCountry: (id: string) =>
    useApiQuery<Country>(["countries", id], `/admin/countries/${id}`),

  createCountry: () =>
    useApiMutation<Country, CountrySchemaType>("/admin/countries", {
      method: "post",
      invalidate: ["countries"],
      successMessage: "Pays ajouté",
    }),

  updateCountry: (id: string) =>
    useApiMutation<Country, Partial<CountrySchemaType>>(
      `/admin/countries/${id}`,
      {
        method: "patch",
        invalidate: ["countries"],
        successMessage: "Pays modifié",
      },
    ),

  deleteCountry: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/countries/${id}`, {
      method: "delete",
      invalidate: ["countries"],
      successMessage: "Pays supprimé",
    }),

  // ─── Cities (standalone) ────────────────────────────────────────────────────
  getCities: (params?: GetCitiesParams) =>
    useApiQuery<PaginatedResult<City>>(["cities", params], "/admin/cities", {
      params,
    }),

  getCity: (id: string) =>
    useApiQuery<City>(["cities", id], `/admin/cities/${id}`),

  createCity: () =>
    useApiMutation<City, CitySchemaType>("/admin/cities", {
      method: "post",
      invalidate: ["cities", "countries"],
      successMessage: "Ville ajoutée",
    }),

  updateCity: (id: string) =>
    useApiMutation<City, Partial<CitySchemaType>>(`/admin/cities/${id}`, {
      method: "patch",
      invalidate: ["cities", "countries"],
      successMessage: "Ville modifiée",
    }),

  deleteCity: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/cities/${id}`, {
      method: "delete",
      invalidate: ["cities", "countries"],
      successMessage: "Ville supprimée",
    }),
};
