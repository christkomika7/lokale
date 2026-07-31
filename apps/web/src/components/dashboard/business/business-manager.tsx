import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import Input from "#/components/input/input";
import { Button } from "#/components/ui/button";
import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";
import Pagination from "#/components/pagination/pagination";
import SelectField from "#/components/select/select-field";
import { useDebouncedValue } from "#/hook/use-debounced-value";
import { PER_PAGE } from "@lokale/config/pagination";
import { DEBOUND } from "@lokale/config/input";

import { BusinessDetail } from "./business-detail";
import { BusinessForm } from "./business-form";
import ViewToggle, { type BusinessView } from "./view-toggle";
import { businessApi } from "./lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type {
  Business,
  BusinessSchemaType,
  BusinessStatus,
} from "@lokale/types/business";
import BusinessesTable from "#/components/table/business/business";
import BusinessesGrid from "./business-grid";

const STATUS_OPTIONS: { value: BusinessStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "ACTIVE", label: "Actif" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "CLOSED", label: "Fermé" },
];

const columnHelper = createColumnHelper<Business>();

export default function BusinessManager() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<BusinessView>("table");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, DEBOUND);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | "">("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const sortField = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isFetching } = businessApi.getBusinesses({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    sortBy: sortField,
    sortOrder,
    status: statusFilter || undefined,
  });

  const businesses = data?.items ?? [];
  const meta = data?.meta;

  const createBusiness = businessApi.createBusiness();
  const updateBusiness = businessApi.updateBusiness(selectedId ?? "");
  const updateStatus = businessApi.updateBusinessStatus(selectedId ?? "");
  const deleteBusiness = businessApi.deleteBusiness(selectedId ?? "");

  const selected = businesses.find((b) => b.id === selectedId) ?? null;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Nom",
        enableSorting: true,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Statut",
        enableSorting: true,
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Inscription",
        enableSorting: true,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: businesses,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  function openDetail(business: Business) {
    setSelectedId(business.id);
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
    deleteBusiness.mutate(undefined, { onSuccess: closePanel });
  }

  function handleToggleStatus(business: Business) {
    const next = business.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateStatus.mutate({ status: next });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: string | null) {
    setStatusFilter((value as BusinessStatus) ?? "");
    setPage(1);
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Entreprises</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter une entreprise
        </Button>
      </div>

      <div className="flex items-center gap-3 p-2.5 border-b border-input dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/10">
        <Input
          type="search"
          icon={Search}
          position="left"
          placeholder="Rechercher une entreprise…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm"
        />
        <SelectField
          value={statusFilter}
          onValueChange={handleStatusFilterChange}
          options={STATUS_OPTIONS}
          placeholder="Tous les statuts"
          className="max-w-40 h-9"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {meta?.total ?? 0} entreprise{(meta?.total ?? 0) !== 1 ? "s" : ""}
        </span>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "table" ? (
        <BusinessesTable
          rows={rows}
          isLoading={isLoading}
          isFetching={isFetching}
          selectedId={selectedId}
          onOpen={openDetail}
          onClose={closePanel}
          panelMode={mode}
        />
      ) : (
        <BusinessesGrid
          businesses={businesses}
          isLoading={isLoading}
          isFetching={isFetching}
          selectedId={selectedId}
          onOpen={openDetail}
        />
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end p-3 border-t border-input dark:border-neutral-700">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <PanelContainer<Business>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(business, actions) => (
          <BusinessDetail
            business={business}
            onEdit={actions.toEdit}
            onDelete={handleDelete}
            onClose={actions.close}
            onToggleStatus={() => handleToggleStatus(business)}
            isDeleting={deleteBusiness.isPending}
            isTogglingStatus={updateStatus.isPending}
          />
        )}
        edit={(business, actions) => (
          <BusinessForm
            defaultValues={business}
            onSubmit={(v: BusinessSchemaType) => {
              updateBusiness.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateBusiness.isPending}
          />
        )}
        create={(actions) => (
          <BusinessForm
            onSubmit={(v: BusinessSchemaType) => {
              createBusiness.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createBusiness.isPending}
          />
        )}
      />
    </div>
  );
}
