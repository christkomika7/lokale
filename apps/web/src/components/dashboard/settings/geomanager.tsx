import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { useGeoManagerStore } from "#/store/geomanager";

import CurrencyManager from "./geo/currency-manager";
import CountryManager from "./geo/country-manager";
import CityManager from "./geo/city-manager";

export default function GeoManager() {
  const { activeTab, setActiveTab } = useGeoManagerStore();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      className="space-y-3"
    >
      <TabsList>
        <TabsTrigger value="countries">Pays</TabsTrigger>
        <TabsTrigger value="cities">Villes</TabsTrigger>
        <TabsTrigger value="currencies">Devises</TabsTrigger>
      </TabsList>

      <TabsContent value="countries" className="space-y-3 min-h-70">
        <CountryManager />
      </TabsContent>

      <TabsContent value="cities" className="space-y-3 min-h-70">
        <CityManager />
      </TabsContent>

      <TabsContent value="currencies" className="space-y-3 min-h-90">
        <CurrencyManager />
      </TabsContent>
    </Tabs>
  );
}
