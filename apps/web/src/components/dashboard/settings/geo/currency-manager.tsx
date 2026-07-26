import { useState, useMemo } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { CurrencyDetail } from "./currency/currency-detail";
import { CurrencyForm } from "./currency/currency-form";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { api } from "./lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type { Currency } from "@lokale/types/localisation";

import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";
import InputIcon from "#/components/input/input-icon";

interface CurrencyManagerProps {
  currencies: Currency[];
  countryCountByCurrency: Record<string, number>;
  isLoading?: boolean;
}

// TODO: revoir l'affichage des devises (Utiliser tanstack table avec son systeme de filtres)

export default function CurrencyManager({
  currencies,
  countryCountByCurrency,
  isLoading,
}: CurrencyManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const createCurrency = api.createCurrency();
  const updateCurrency = api.updateCurrency(selectedId ?? "");
  const deleteCurrency = api.deleteCurrency(selectedId ?? "");

  const filtered = useMemo(
    () =>
      currencies.filter(
        (c) =>
          c.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          c.code.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [currencies, globalFilter],
  );

  const selected = currencies.find((c) => c.id === selectedId) ?? null;

  function openDetail(currency: Currency) {
    setSelectedId(currency.id);
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

  function handleDelete(id: string) {
    const count = countryCountByCurrency[id] ?? 0;
    if (
      count > 0 &&
      !confirm(`${count} pays utilisent cette devise. Supprimer quand même ?`)
    )
      return;
    deleteCurrency.mutate(undefined, { onSuccess: closePanel });
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="mb-0">Devises</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter une devise
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-input dark:border-neutral-700 bg-slate-50/40 dark:bg-neutral-800/10">
        <InputIcon
          type="search"
          icon={Search}
          placeholder="Rechercher un pays…"
          value={globalFilter}
          position="left"
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm!"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {filtered.length} devise{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-neutral-400">
          Aucune devise trouvée.
        </div>
      ) : (
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-input dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/20">
              <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                Nom
              </th>
              <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                Code
              </th>
              <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                Symbole
              </th>
              <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                Pays
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-neutral-800/60">
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/10 transition-colors cursor-pointer"
                onClick={() => openDetail(c)}
              >
                <td className="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-200">
                  {c.name}
                </td>
                <td className="px-3 py-2 text-neutral-400">{c.code}</td>
                <td className="px-3 py-2 text-neutral-400">
                  {c.symbol || "—"}
                </td>
                <td className="px-3 py-2">
                  <Badge variant="info" className="min-w-10">
                    {countryCountByCurrency[c.id] ?? 0}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PanelContainer<Currency>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(currency, actions) => (
          <CurrencyDetail
            currency={currency}
            countryCount={countryCountByCurrency[currency.id] ?? 0}
            onEdit={actions.toEdit}
            onDelete={() => handleDelete(currency.id)}
            onClose={actions.close}
            isDeleting={deleteCurrency.isPending}
          />
        )}
        edit={(currency, actions) => (
          <CurrencyForm
            defaultValues={currency}
            onSubmit={(v) => {
              updateCurrency.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateCurrency.isPending}
          />
        )}
        create={(actions) => (
          <CurrencyForm
            onSubmit={(v) => {
              createCurrency.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createCurrency.isPending}
          />
        )}
      />
    </div>
  );
}
