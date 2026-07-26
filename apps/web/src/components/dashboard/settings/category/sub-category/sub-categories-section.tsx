import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";

import Input from "#/components/input/input";
import { Button } from "#/components/ui/button";
import PanelContainer from "#/components/sheet/panel-container";

import type { PanelMode } from "@lokale/types/panel";
import type {
  SubCategory,
  SubCategorySchemaType,
} from "@lokale/types/category";
import { categoryApi } from "../lib/api";
import { SubCategoryDetail } from "./sub-category-detail";
import { SubCategoryForm } from "./sub-category-form";

interface SubCategoriesSectionProps {
  categoryId: string;
  subCategories: SubCategory[];
}

export function SubCategoriesSection({
  categoryId,
  subCategories,
}: SubCategoriesSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const createSubCategory = categoryApi.createSubCategory(categoryId);
  const updateSubCategory = categoryApi.updateSubCategory(
    categoryId,
    selectedId ?? "",
  );
  const deleteSubCategory = categoryApi.deleteSubCategory(
    categoryId,
    selectedId ?? "",
  );

  const filtered = useMemo(
    () =>
      subCategories.filter((sc) =>
        sc.name.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [subCategories, globalFilter],
  );

  const selected = subCategories.find((sc) => sc.id === selectedId) ?? null;

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

  return (
    <div className="border-t border-input dark:border-neutral-700">
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50/40 dark:bg-neutral-800/10">
        <Input
          type="search"
          icon={Search}
          position="left"
          placeholder="Filtrer les sous-catégories…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-45 text-[11px] rounded-sm"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {filtered.length} sous-catégorie{filtered.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={openCreate}
          className="rounded-sm"
        >
          <Plus className="size-3" /> Ajouter
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="px-3 py-4 text-center text-[12px] text-neutral-400">
          Aucune sous-catégorie —{" "}
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
                  Nom
                </th>
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Slug
                </th>
                <th className="p-3 text-left font-normal text-[11px] uppercase tracking-wide text-neutral-400">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
              {filtered.map((sc) => (
                <tr
                  key={sc.id}
                  className="hover:bg-neutral-50/40 dark:hover:bg-neutral-800/10 transition-colors cursor-pointer"
                  onClick={() => openDetail(sc)}
                >
                  <td className="p-3 font-medium text-neutral-700 dark:text-neutral-200">
                    {sc.name}
                  </td>
                  <td className="p-3 text-neutral-400 font-mono">{sc.slug}</td>
                  <td className="p-3 text-neutral-400">
                    {sc.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            onDelete={() => {
              deleteSubCategory.mutate(undefined, {
                onSuccess: () => {
                  actions.close();
                  closePanel();
                },
              });
            }}
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
