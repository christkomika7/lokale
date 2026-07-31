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
import { PER_PAGE } from "@lokale/config/pagination";
import { DEBOUND } from "@lokale/config/input";
import { api } from "./lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type { City } from "@lokale/types/localisation";

import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";
import InputIcon from "#/components/input/input-icon";
import Text from "#/components/typography/Text";
import CitiesTable from "#/components/table/localisation/city/city";
import Pagination from "#/components/pagination/pagination";

import CityDetail from "./city/city-detail";
import { CityForm } from "./city/city-form";

const columnHelper = createColumnHelper<City>();

export default function CityManager() {
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

  const { data, isLoading, isFetching } = api.getCities({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    sortBy: sortField,
    sortOrder,
  });

  const cities = data?.items ?? [];
  const meta = data?.meta;

  const createCity = api.createCity();
  const updateCity = api.updateCity(selectedId ?? "");
  const deleteCity = api.deleteCity(selectedId ?? "");

  const selected = cities.find((c) => c.id === selectedId) ?? null;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Ville",
        enableSorting: true,
      }),
      columnHelper.accessor("region", {
        id: "region",
        header: "Région",
        enableSorting: true,
      }),
      columnHelper.accessor("population", {
        id: "population",
        header: "Population",
        enableSorting: true,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: cities,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

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

  function handleDelete() {
    deleteCity.mutate(undefined, { onSuccess: closePanel });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Villes</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter une ville
        </Button>
      </div>

      <div className="flex items-center gap-3 p-2.5 border-b border-input dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/10">
        <InputIcon
          type="search"
          icon={Search}
          placeholder="Rechercher une ville…"
          value={search}
          position="left"
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm!"
        />
        <Text className="ml-auto" size="xxs">
          {meta?.total ?? 0} ville{(meta?.total ?? 0) !== 1 ? "s" : ""}
        </Text>
      </div>

      <CitiesTable
        rows={rows}
        isLoading={isLoading}
        isFetching={isFetching}
        selectedId={selectedId}
        onOpen={openDetail}
        onClose={closePanel}
        panelMode={mode}
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end p-3 border-t border-input dark:border-neutral-700">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
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
            onDelete={handleDelete}
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
