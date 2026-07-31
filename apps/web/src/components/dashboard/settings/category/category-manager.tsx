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

import { CategoryDetail } from "./category-detail";
import { CategoryForm } from "./category-form";
import { categoryApi } from "./lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type { Category, CategorySchemaType } from "@lokale/types/category";
import CategoriesTable from "#/components/table/category/category";

const columnHelper = createColumnHelper<Category>();

export default function CategoryManager() {
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

  const { data, isLoading, isFetching } = categoryApi.getCategories({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch,
    sortBy: sortField,
    sortOrder,
  });

  const categories = data?.items ?? [];
  const meta = data?.meta;

  const createCategory = categoryApi.createCategory();
  const updateCategory = categoryApi.updateCategory(selectedId ?? "");
  const deleteCategory = categoryApi.deleteCategory(selectedId ?? "");

  const selected = categories.find((c) => c.id === selectedId) ?? null;

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
    data: categories,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  function openDetail(category: Category) {
    setSelectedId(category.id);
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

  function handleDelete(category: Category) {
    const count =
      category._count?.subCategories ?? category.subCategories.length;
    if (
      count > 0 &&
      !confirm(
        `Cette catégorie a ${count} sous-catégorie(s). Supprimer quand même ?`,
      )
    )
      return;
    deleteCategory.mutate(undefined, { onSuccess: closePanel });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">Catégories</Heading>
        <Button
          variant="amber"
          size="sm"
          className="rounded-md gap-1.5 text-[13px] h-8"
          onClick={openCreate}
        >
          <Plus className="size-3.5" /> Ajouter une catégorie
        </Button>
      </div>

      <div className="flex items-center gap-3 p-2.5 border-b border-input dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/10">
        <Input
          type="search"
          icon={Search}
          position="left"
          placeholder="Rechercher une catégorie…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {meta?.total ?? 0} catégorie{(meta?.total ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      <CategoriesTable
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

      <PanelContainer<Category>
        open={open}
        mode={mode}
        data={selected}
        onClose={closePanel}
        onModeChange={setMode}
        detail={(category, actions) => (
          <CategoryDetail
            category={category}
            onEdit={actions.toEdit}
            onDelete={() => handleDelete(category)}
            onClose={actions.close}
            isDeleting={deleteCategory.isPending}
          />
        )}
        edit={(category, actions) => (
          <CategoryForm
            defaultValues={category}
            onSubmit={(v: CategorySchemaType) => {
              updateCategory.mutate(v, { onSuccess: actions.toDetail });
            }}
            onCancel={actions.toDetail}
            isSubmitting={updateCategory.isPending}
          />
        )}
        create={(actions) => (
          <CategoryForm
            onSubmit={(v: CategorySchemaType) => {
              createCategory.mutate(v, { onSuccess: actions.close });
            }}
            onCancel={actions.close}
            isSubmitting={createCategory.isPending}
          />
        )}
      />
    </div>
  );
}
