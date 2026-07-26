import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { api } from "./geo/lib/api";

import CurrencyManager from "./geo/currency-manager";
import CountryManager from "./geo/country-manager";

export default function GeoManager() {
  const { data: currencies, isLoading: currenciesLoading } =
    api.getCurrencies();
  const { data: countries, isLoading: countriesLoading } = api.getCountries();

  if (currenciesLoading || countriesLoading || !currencies || !countries) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const countryCountByCurrency = countries.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.currencyId] = (acc[c.currencyId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <Tabs defaultValue="countries" className="space-y-3">
      <TabsList>
        <TabsTrigger value="countries">Pays & Villes</TabsTrigger>
        <TabsTrigger value="currencies">Devises</TabsTrigger>
      </TabsList>

      <TabsContent value="countries" className="space-y-3">
        <CountryManager countries={countries} currencies={currencies} />
      </TabsContent>

      <TabsContent value="currencies" className="space-y-3">
        <CurrencyManager
          currencies={currencies}
          countryCountByCurrency={countryCountByCurrency}
        />
      </TabsContent>
    </Tabs>
  );
}
