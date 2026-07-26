import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Loader2,
  Search,
} from "lucide-react";

import Input from "#/components/input/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import Heading from "#/components/typography/heading";
import PanelContainer from "#/components/sheet/panel-container";

import { CategoryDetail } from "./category/category-detail";
import { CategoryForm } from "./category/category-form";
import { SubCategoriesSection } from "./category/sub-category/sub-categories-section";
import { categoryApi } from "./category/lib/api";

import type { PanelMode } from "@lokale/types/panel";
import type { Category, CategorySchemaType } from "@lokale/types/category";

export default function CategoryManager() {
  const { data: categories, isLoading } = categoryApi.getCategories();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [globalFilter, setGlobalFilter] = useState("");

  const createCategory = categoryApi.createCategory();
  const updateCategory = categoryApi.updateCategory(selectedId ?? "");
  const deleteCategory = categoryApi.deleteCategory(selectedId ?? "");

  const filtered = useMemo(
    () =>
      (categories ?? []).filter(
        (c) =>
          c.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          c.slug.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [categories, globalFilter],
  );

  const selected = (categories ?? []).find((c) => c.id === selectedId) ?? null;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
    if (
      category.subCategories.length > 0 &&
      !confirm(
        `Cette catégorie a ${category.subCategories.length} sous-catégorie(s). Supprimer quand même ?`,
      )
    )
      return;
    deleteCategory.mutate(undefined, { onSuccess: closePanel });
  }

  return (
    <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
        <Heading className="text-2xl mb-0!">
          Catégories &amp; Sous-catégories
        </Heading>
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
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-55 text-[12px] rounded-sm"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {filtered.length} catégorie{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-neutral-400">
          Aucune catégorie trouvée.
        </div>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
          {filtered.map((c) => (
            <div key={c.id}>
              <div
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors ${
                  expandedIds.has(c.id)
                    ? "bg-neutral-50/40 dark:bg-neutral-800/10"
                    : ""
                }`}
                onClick={() => toggleExpand(c.id)}
              >
                {expandedIds.has(c.id) ? (
                  <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronRight className="size-3.5 text-neutral-400 shrink-0" />
                )}

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.color && (
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ background: c.color }}
                      />
                    )}
                    {c.icon && (
                      <span className="text-base leading-none">{c.icon}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      /{c.slug}
                    </p>
                  </div>
                </div>

                <Badge variant="info">{c.subCategories.length} sous-cat.</Badge>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    className="h-6 rounded-md"
                    onClick={() => openDetail(c)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>

              {expandedIds.has(c.id) && (
                <SubCategoriesSection
                  categoryId={c.id}
                  subCategories={c.subCategories}
                />
              )}
            </div>
          ))}
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
