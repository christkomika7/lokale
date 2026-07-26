import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { CountryDetail } from "./country/country-detail";

import type { PanelMode } from "@lokale/types/panel";
import { CountryForm, type CountryFormValues } from "./country/country-form";
import type { Country, Currency } from "@lokale/types/localisation";

import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";
import CityManager from "./city-manager";
import InputIcon from "#/components/input/input-icon";
import Text from "#/components/typography/Text";
import { api } from "./lib/api";

interface CountryManagerProps {
  countries: Country[];
  currencies: Currency[];
  isLoading?: boolean;
}

// TODO: revoir l'affichage des pays (Utiliser tanstack table avec son systeme de filtres)

export default function CountryManager({
  countries,
  currencies,
  isLoading,
}: CountryManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [globalFilter, setGlobalFilter] = useState("");

  const createCountry = api.createCountry();
  const updateCountry = api.updateCountry(selectedId ?? "");
  const deleteCountry = api.deleteCountry(selectedId ?? "");

  const filtered = useMemo(
    () =>
      countries.filter(
        (p) =>
          p.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          p.code.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [countries, globalFilter],
  );

  const selected = countries.find((c) => c.id === selectedId) ?? null;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openDetail(country: Country) {
    setSelectedId(country.id);
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

  function handleDelete(country: Country) {
    if (
      country.cities.length > 0 &&
      !confirm(
        `Ce pays a ${country.cities.length} ville(s). Supprimer quand même ?`,
      )
    )
      return;
    deleteCountry.mutate(undefined, { onSuccess: closePanel });
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Pays &amp; Villes</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter un pays
        </Button>
      </div>

      <div className="flex items-center gap-3 p-2.5 border-b border-input dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/10">
        <InputIcon
          type="search"
          icon={Search}
          placeholder="Rechercher un pays…"
          value={globalFilter}
          position="left"
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm!"
        />
        <Text className="ml-auto" size="xxs">
          {filtered.length} pays
        </Text>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-neutral-400">
          Aucun pays trouvé.
        </div>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
          {filtered.map((p) => (
            <div key={p.id}>
              <div
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors ${
                  expandedIds.has(p.id)
                    ? "bg-neutral-50/40 dark:bg-neutral-800/10"
                    : ""
                }`}
                onClick={() => toggleExpand(p.id)}
              >
                {expandedIds.has(p.id) ? (
                  <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronRight className="size-3.5 text-neutral-400 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {p.code} · {p.continent || "—"} · {p.phoneCode || "—"} ·{" "}
                    {p.currency.code}
                  </p>
                </div>

                <Badge className="bg-neutral-100 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-400 shrink-0">
                  {p.cities.length} ville{p.cities.length !== 1 ? "s" : ""}
                </Badge>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md"
                    onClick={() => openDetail(p)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>

              {expandedIds.has(p.id) && (
                <CityManager countryId={p.id} cities={p.cities} />
              )}
            </div>
          ))}
        </div>
      )}

      <PanelContainer<Country>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(country, actions) => (
          <CountryDetail
            country={country}
            onEdit={actions.toEdit}
            onDelete={() => handleDelete(country)}
            onClose={actions.close}
            isDeleting={deleteCountry.isPending}
          />
        )}
        edit={(country, actions) => (
          <CountryForm
            defaultValues={country}
            currencies={currencies}
            onSubmit={(v: CountryFormValues) => {
              updateCountry.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateCountry.isPending}
          />
        )}
        create={(actions) => (
          <CountryForm
            currencies={currencies}
            onSubmit={(v: CountryFormValues) => {
              createCountry.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createCountry.isPending}
          />
        )}
      />
    </div>
  );
}
