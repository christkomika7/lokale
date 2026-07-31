import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "#/components/ui/button";
import { useDebouncedValue } from "#/hook/use-debounced-value";
import { CountryDetail } from "./country/country-detail";
import { CountryForm, type CountryFormValues } from "./country/country-form";
import { PER_PAGE } from "@lokale/config/pagination";
import { DEBOUND } from "@lokale/config/input";
import { api } from "./lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type { Country } from "@lokale/types/localisation";

import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";
import InputIcon from "#/components/input/input-icon";
import Text from "#/components/typography/Text";
import CountriesTable from "#/components/table/localisation/country/country";
import Pagination from "#/components/pagination/pagination";

const columnHelper = createColumnHelper<Country>();

export default function CountryManager() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, DEBOUND);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const sortField = sorting[0]?.id ?? "name";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = api.getCountries({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    sortBy: sortField,
    sortOrder,
  });

  // Liste complète des devises pour alimenter le select du formulaire —
  // perPage large volontairement (pas une vraie pagination ici, juste
  // une liste à choix).
  const { data: currenciesData, isLoading: currenciesLoading } =
    api.getCurrencies({ perPage: 200, sortBy: "name", sortOrder: "asc" });
  const currencies = currenciesData?.items ?? [];

  const countries = data?.items ?? [];
  const meta = data?.meta;

  const createCountry = api.createCountry();
  const updateCountry = api.updateCountry(selectedId ?? "");
  const deleteCountry = api.deleteCountry(selectedId ?? "");

  const selected = countries.find((c) => c.id === selectedId) ?? null;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Pays",
        enableSorting: true,
      }),
      columnHelper.accessor("code", {
        id: "code",
        header: "Code",
        enableSorting: true,
      }),
      columnHelper.accessor("continent", {
        id: "continent",
        header: "Continent",
        enableSorting: true,
      }),
      columnHelper.accessor("phoneCode", {
        id: "phoneCode",
        header: "Indicatif",
        enableSorting: false,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: countries,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

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

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Pays</Heading>
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
          value={search}
          position="left"
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm!"
        />
        <Text className="ml-auto" size="xxs">
          {meta?.total ?? 0} pays
        </Text>
      </div>

      <CountriesTable
        rows={rows}
        isLoading={isLoading}
        isFetching={isFetching}
        selectedId={selectedId}
        onOpen={openDetail}
        onClose={closePanel}
        panelMode={mode}
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end  p-3 border-t border-input dark:border-neutral-700">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
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
            isSubmitting={updateCountry.isPending || currenciesLoading}
          />
        )}
        create={(actions) => (
          <CountryForm
            currencies={currencies}
            onSubmit={(v: CountryFormValues) => {
              createCountry.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createCountry.isPending || currenciesLoading}
          />
        )}
      />
    </div>
  );
}
