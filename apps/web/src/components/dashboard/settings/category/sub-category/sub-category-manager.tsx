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
import { useDebouncedValue } from "#/hook/use-debounced-value";
import { PER_PAGE } from "@lokale/config/pagination";
import { DEBOUND } from "@lokale/config/input";

import { categoryApi } from "../lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type {
  SubCategory,
  SubCategorySchemaType,
} from "@lokale/types/category";
import SubCategoriesTable from "#/components/table/sub-category/sub-category";
import { SubCategoryDetail } from "./sub-category-detail";
import { SubCategoryForm } from "./sub-category-form";

const columnHelper = createColumnHelper<SubCategory>();

export default function SubCategoryManager() {
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

  const { data, isLoading, isFetching } = categoryApi.getSubCategories({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    sortBy: sortField,
    sortOrder,
  });

  const subCategories = data?.items ?? [];
  const meta = data?.meta;

  const createSubCategory = categoryApi.createSubCategory();
  const updateSubCategory = categoryApi.updateSubCategory(selectedId ?? "");
  const deleteSubCategory = categoryApi.deleteSubCategory(selectedId ?? "");

  const selected = subCategories.find((sc) => sc.id === selectedId) ?? null;

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Nom",
        enableSorting: true,
      }),
      columnHelper.accessor("slug", {
        id: "slug",
        header: "Slug",
        enableSorting: true,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: subCategories,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  function openDetail(sc: SubCategory) {
    setSelectedId(sc.id);
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
    deleteSubCategory.mutate(undefined, { onSuccess: closePanel });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Sous-catégories</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter une sous-catégorie
        </Button>
      </div>

      <div className="flex items-center gap-3 p-2.5 border-b border-input dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/10">
        <Input
          type="search"
          icon={Search}
          position="left"
          placeholder="Rechercher une sous-catégorie…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {meta?.total ?? 0} sous-catégorie{(meta?.total ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      <SubCategoriesTable
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

      <PanelContainer<SubCategory>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(sc, actions) => (
          <SubCategoryDetail
            subCategory={sc}
            onEdit={actions.toEdit}
            onDelete={handleDelete}
            onClose={actions.close}
            isDeleting={deleteSubCategory.isPending}
          />
        )}
        edit={(sc, actions) => (
          <SubCategoryForm
            defaultValues={sc}
            onSubmit={(v: SubCategorySchemaType) => {
              updateSubCategory.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateSubCategory.isPending}
          />
        )}
        create={(actions) => (
          <SubCategoryForm
            onSubmit={(v: SubCategorySchemaType) => {
              createSubCategory.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createSubCategory.isPending}
          />
        )}
      />
    </div>
  );
}
