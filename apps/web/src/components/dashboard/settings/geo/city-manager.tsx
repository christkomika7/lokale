import { useState, useMemo } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { CityForm } from "./city/city-form";
import { api } from "./lib/api";
import { CITY_TYPE_CLASS, CITY_TYPE_LABELS } from "@lokale/config/localisation";

import type { PanelMode } from "@lokale/types/panel";
import type { City } from "@lokale/types/localisation";

import PanelContainer from "#/components/sheet/panel-container";
import CityDetail from "./city/city-detail";
import InputIcon from "#/components/input/input-icon";

interface CityManagerProps {
  countryId: string;
  cities: City[];
  isLoading?: boolean;
}

// TODO: revoir l'affichage des villes (Utiliser tanstack table avec son systeme de filtres)

export default function CityManager({
  countryId,
  cities,
  isLoading,
}: CityManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const createCity = api.createCity(countryId);
  const updateCity = api.updateCity(countryId, selectedId ?? "");
  const deleteCity = api.deleteCity(countryId, selectedId ?? "");

  const filtered = useMemo(
    () =>
      cities.filter((c) =>
        c.name.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [cities, globalFilter],
  );

  const selected = cities.find((c) => c.id === selectedId) ?? null;

  function openDetail(city: City) {
    setSelectedId(city.id);
    setMode("detail");
    setOpen(true);
  }

  function openCreate() {
    setSelectedId(null);
    setMode("create");
    setOpen(true);
  }

  function closePanel() {
    setSelectedId(null);
    setOpen(false);
  }

  return (
    <div className="border-t border-input dark:border-neutral-700">
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50/40 dark:bg-neutral-800/10">
        <InputIcon
          type="search"
          icon={Search}
          placeholder="Rechercher une ville…"
          value={globalFilter}
          position="left"
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm!"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {filtered.length} ville{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md"
          onClick={openCreate}
        >
          <Plus className="size-3" /> Ajouter une ville
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-3 text-center text-[12px] text-neutral-400">
          Aucune ville —{" "}
          <button
            className="text-amber-500 hover:text-amber-600 font-medium"
            onClick={openCreate}
          >
            en ajouter une
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-input dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/20">
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Ville
                </th>
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Région
                </th>
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Type
                </th>
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Population
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/10 transition-colors cursor-pointer"
                  onClick={() => openDetail(c)}
                >
                  <td className="p-3 font-medium text-neutral-700 dark:text-neutral-200">
                    {c.name}
                  </td>
                  <td className="p-3 text-neutral-400">{c.region || "—"}</td>
                  <td className="p-3">
                    <Badge variant="info">{CITY_TYPE_LABELS[c.type]}</Badge>
                  </td>
                  <td className="p-3 text-neutral-400">
                    {c.population ? c.population.toLocaleString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PanelContainer<City>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(city, actions) => (
          <CityDetail
            city={city}
            onEdit={actions.toEdit}
            onDelete={() => {
              deleteCity.mutate(undefined, {
                onSuccess: () => {
                  actions.close();
                  closePanel();
                },
              });
            }}
            onClose={actions.close}
            isDeleting={deleteCity.isPending}
          />
        )}
        edit={(city, actions) => (
          <CityForm
            defaultValues={city}
            onSubmit={(v) => {
              updateCity.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateCity.isPending}
          />
        )}
        create={(actions) => (
          <CityForm
            onSubmit={(v) => {
              createCity.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createCity.isPending}
          />
        )}
      />
    </div>
  );
}
