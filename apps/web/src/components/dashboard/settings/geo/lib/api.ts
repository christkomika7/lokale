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

export const api = {
  getCurrencies: () =>
    useApiQuery<Currency[]>(["currencies"], "/admin/currencies"),

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

  getCountries: () => useApiQuery<Country[]>(["countries"], "/admin/countries"),

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

  createCity: (countryId: string) =>
    useApiMutation<City, CitySchemaType>(`/admin/${countryId}/cities`, {
      method: "post",
      invalidate: ["countries"],
      successMessage: "Ville ajoutée",
    }),

  updateCity: (countryId: string, cityId: string) =>
    useApiMutation<City, Partial<CitySchemaType>>(
      `/admin/${countryId}/cities/${cityId}`,
      {
        method: "patch",
        invalidate: ["countries"],
        successMessage: "Ville modifiée",
      },
    ),

  deleteCity: (countryId: string, cityId: string) =>
    useApiMutation<{ id: string }, void>(
      `/admin/${countryId}/cities/${cityId}`,
      {
        method: "delete",
        invalidate: ["countries"],
        successMessage: "Ville supprimée",
      },
    ),
};
