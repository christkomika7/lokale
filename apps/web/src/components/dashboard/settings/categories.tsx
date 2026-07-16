"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Save,
  ArrowUpDown,
  Tag,
  Layers,
} from "lucide-react";

import Input from "#/components/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";
import { Badge } from "#/components/ui/badge";
import Heading from "#/components/typography/heading";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutCategorie = "actif" | "inactif";
type VisibiliteCategorie = "publique" | "privée" | "brouillon";

interface SousCategorie {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  statut: StatutCategorie;
}

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  couleur?: string;
  icone?: string;
  visibilite: VisibiliteCategorie;
  statut: StatutCategorie;
  sousCategories: SousCategorie[];
}

// ─── Badge config ──────────────────────────────────────────────────────────────

const STATUT_VARIANT: Record<StatutCategorie, "success" | "error"> = {
  actif: "success",
  inactif: "error",
};

const VISIBILITE_VARIANT: Record<
  VisibiliteCategorie,
  "info" | "neutral" | "warning"
> = {
  publique: "info",
  privée: "neutral",
  brouillon: "warning",
};

const VISIBILITE_OPTIONS: VisibiliteCategorie[] = [
  "publique",
  "privée",
  "brouillon",
];

const COULEURS = [
  { label: "Ambre", value: "#f59e0b" },
  { label: "Bleu", value: "#3b82f6" },
  { label: "Vert", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Orange", value: "#f97316" },
  { label: "Slate", value: "#64748b" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED: Categorie[] = [
  {
    id: "c1",
    nom: "Électronique",
    slug: "electronique",
    description: "Produits électroniques et high-tech",
    couleur: "#3b82f6",
    icone: "💻",
    visibilite: "publique",
    statut: "actif",
    sousCategories: [
      { id: "sc1", nom: "Smartphones", slug: "smartphones", statut: "actif" },
      { id: "sc2", nom: "Ordinateurs", slug: "ordinateurs", statut: "actif" },
      { id: "sc3", nom: "Accessoires", slug: "accessoires", statut: "inactif" },
    ],
  },
  {
    id: "c2",
    nom: "Mode & Vêtements",
    slug: "mode-vetements",
    description: "Habillement, chaussures et accessoires de mode",
    couleur: "#f43f5e",
    icone: "👗",
    visibilite: "publique",
    statut: "actif",
    sousCategories: [
      { id: "sc4", nom: "Femme", slug: "femme", statut: "actif" },
      { id: "sc5", nom: "Homme", slug: "homme", statut: "actif" },
    ],
  },
  {
    id: "c3",
    nom: "Brouillons",
    slug: "brouillons",
    visibilite: "brouillon",
    statut: "inactif",
    sousCategories: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;
  return <p className="text-[11px] text-red-500 mt-0.5">{errors.join(", ")}</p>;
}

// ─── CategorieModal ───────────────────────────────────────────────────────────

interface CategorieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Categorie;
  onSubmit: (values: Omit<Categorie, "id" | "sousCategories">) => void;
}

function CategorieModal({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: CategorieModalProps) {
  const form = useForm({
    defaultValues: {
      nom: defaultValues?.nom ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      couleur: defaultValues?.couleur ?? "",
      icone: defaultValues?.icone ?? "",
      visibilite:
        defaultValues?.visibilite ?? ("publique" as VisibiliteCategorie),
      statut: defaultValues?.statut ?? ("actif" as StatutCategorie),
    },
    onSubmit: ({ value }) => {
      onSubmit({
        nom: value.nom.trim(),
        slug: value.slug || toSlug(value.nom),
        description: value.description.trim() || undefined,
        couleur: value.couleur || undefined,
        icone: value.icone.trim() || undefined,
        visibilite: value.visibilite,
        statut: value.statut,
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">
            {defaultValues ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4 py-1"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Nom */}
            <form.Field
              name="nom"
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "Nom obligatoire" : undefined,
              }}
            >
              {(field) => (
                <div className="col-span-2">
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Nom *
                  </label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      // Auto-fill slug if not manually edited
                    }}
                    onBlur={field.handleBlur}
                    placeholder="ex: Électronique"
                    className="h-9 text-[13px]"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {/* Slug */}
            <form.Field name="slug">
              {(field) => (
                <div className="col-span-2">
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Slug{" "}
                    <span className="text-neutral-400 font-normal">
                      (auto-généré si vide)
                    </span>
                  </label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="electronique"
                    className="h-9 text-[13px] font-mono"
                  />
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div className="col-span-2">
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Description
                  </label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Description optionnelle de la catégorie…"
                    className="text-[13px] resize-none"
                    rows={2}
                  />
                </div>
              )}
            </form.Field>

            {/* Icône */}
            <form.Field name="icone">
              {(field) => (
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Icône (emoji)
                  </label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="💻"
                    className="h-9 text-[13px]"
                  />
                </div>
              )}
            </form.Field>

            {/* Couleur */}
            <form.Field name="couleur">
              {(field) => (
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Couleur
                  </label>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) => field.handleChange(e as string)}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue placeholder="—">
                        {field.state.value && (
                          <span className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ background: field.state.value }}
                            />
                            {
                              COULEURS.find(
                                (c) => c.value === field.state.value,
                              )?.label
                            }
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COULEURS.map((c) => (
                        <SelectItem
                          key={c.value}
                          value={c.value}
                          className="text-[13px]"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ background: c.value }}
                            />
                            {c.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Visibilité */}
            <form.Field name="visibilite">
              {(field) => (
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Visibilité
                  </label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(v as VisibiliteCategorie)
                    }
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITE_OPTIONS.map((v) => (
                        <SelectItem
                          key={v}
                          value={v}
                          className="text-[13px] capitalize"
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Statut */}
            <form.Field name="statut">
              {(field) => (
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                    Statut
                  </label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(v as StatutCategorie)
                    }
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif" className="text-[13px]">
                        Actif
                      </SelectItem>
                      <SelectItem value="inactif" className="text-[13px]">
                        Inactif
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[13px]"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="amber"
              size="sm"
              className="h-8 text-[13px] gap-1.5"
            >
              <Save className="size-3.5" />
              {defaultValues ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── SousCategorieModal ───────────────────────────────────────────────────────

interface SousCategorieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: SousCategorie;
  onSubmit: (values: Omit<SousCategorie, "id">) => void;
}

function SousCategorieModal({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: SousCategorieModalProps) {
  const form = useForm({
    defaultValues: {
      nom: defaultValues?.nom ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      statut: defaultValues?.statut ?? ("actif" as StatutCategorie),
    },
    onSubmit: ({ value }) => {
      onSubmit({
        nom: value.nom.trim(),
        slug: value.slug || toSlug(value.nom),
        description: value.description.trim() || undefined,
        statut: value.statut,
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">
            {defaultValues
              ? "Modifier la sous-catégorie"
              : "Nouvelle sous-catégorie"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-3 py-1"
        >
          {/* Nom */}
          <form.Field
            name="nom"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "Nom obligatoire" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                  Nom *
                </label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="ex: Smartphones"
                  className="h-9 text-[13px]"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Slug */}
          <form.Field name="slug">
            {(field) => (
              <div>
                <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                  Slug{" "}
                  <span className="text-neutral-400 font-normal">
                    (auto-généré si vide)
                  </span>
                </label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="smartphones"
                  className="h-9 text-[13px] font-mono"
                />
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div>
                <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                  Description
                </label>
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Description optionnelle…"
                  className="text-[13px] resize-none"
                  rows={2}
                />
              </div>
            )}
          </form.Field>

          {/* Statut */}
          <form.Field name="statut">
            {(field) => (
              <div>
                <label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
                  Statut
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) =>
                    field.handleChange(v as StatutCategorie)
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif" className="text-[13px]">
                      Actif
                    </SelectItem>
                    <SelectItem value="inactif" className="text-[13px]">
                      Inactif
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-2">
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[13px]"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="amber"
              size="sm"
              className="h-8 text-[13px] gap-1.5"
            >
              <Save className="size-3.5" />
              {defaultValues ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── SousCategoriesSection (TanStack Table) ───────────────────────────────────

interface SousCategoriesSectionProps {
  categorieId: string;
  sousCategories: SousCategorie[];
  onAdd: (categorieId: string, v: Omit<SousCategorie, "id">) => void;
  onEdit: (
    categorieId: string,
    scId: string,
    v: Omit<SousCategorie, "id">,
  ) => void;
  onDelete: (categorieId: string, scId: string) => void;
}

function SousCategoriesSection({
  categorieId,
  sousCategories,
  onAdd,
  onEdit,
  onDelete,
}: SousCategoriesSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SousCategorie | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<SousCategorie>[]>(
    () => [
      {
        accessorKey: "nom",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom <ArrowUpDown className="size-2.5" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-200">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "slug",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Slug
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Description
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {getValue<string | undefined>() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "statut",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Statut
          </span>
        ),
        cell: ({ getValue }) => {
          const s = getValue<StatutCategorie>();
          return <Badge>{s === "actif" ? "Actif" : "Inactif"}</Badge>;
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-md"
              onClick={() => setEditTarget(row.original)}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => {
                onDelete(categorieId, row.original.id);
                toast.success("Sous-catégorie supprimée.");
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ),
      },
    ],
    [categorieId, onDelete],
  );

  const table = useReactTable({
    data: sousCategories,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="border-t border-input dark:border-neutral-700">
      {/* Modals */}
      <SousCategorieModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(v) => {
          onAdd(categorieId, v);
          toast.success("Sous-catégorie ajoutée.");
        }}
      />
      {editTarget && (
        <SousCategorieModal
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          defaultValues={editTarget}
          onSubmit={(v) => {
            onEdit(categorieId, editTarget.id, v);
            setEditTarget(null);
            toast.success("Sous-catégorie modifiée.");
          }}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/40 dark:bg-neutral-800/10">
        <Layers className="size-3 text-neutral-300 dark:text-neutral-600 shrink-0" />
        <Input
          placeholder="Filtrer les sous-catégories…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-6 max-w-[200px] text-[11px] rounded-md border-input dark:border-neutral-700"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {table.getRowModel().rows.length} sous-catégorie
          {table.getRowModel().rows.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 rounded-md text-[11px] gap-1 border-input dark:border-neutral-700"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-3" /> Ajouter
        </Button>
      </div>

      {/* Empty state */}
      {sousCategories.length === 0 ? (
        <div className="px-3 py-4 text-center text-[12px] text-neutral-400">
          Aucune sous-catégorie —{" "}
          <button
            className="text-amber-500 hover:text-amber-600 font-medium"
            onClick={() => setAddOpen(true)}
          >
            en ajouter une
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b border-input dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/20"
                >
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-3 py-1.5 text-left font-normal"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-neutral-800/60">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/40 dark:hover:bg-neutral-800/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CategoryManager() {
  const [categories, setCategories] = useState<Categorie[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Categorie | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["c1"]));
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.nom.toLowerCase().includes(globalFilter.toLowerCase()) ||
          c.slug.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [categories, globalFilter],
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Catégorie CRUD
  function handleAddCategorie(v: Omit<Categorie, "id" | "sousCategories">) {
    setCategories((s) => [...s, { id: nanoid(), ...v, sousCategories: [] }]);
    toast.success("Catégorie ajoutée.");
  }

  function handleEditCategorie(v: Omit<Categorie, "id" | "sousCategories">) {
    setCategories((s) =>
      s.map((c) => (c.id === editTarget?.id ? { ...c, ...v } : c)),
    );
    setEditTarget(null);
    toast.success("Catégorie modifiée.");
  }

  function handleDeleteCategorie(id: string) {
    const count =
      categories.find((c) => c.id === id)?.sousCategories.length ?? 0;
    if (
      count > 0 &&
      !confirm(
        `Cette catégorie a ${count} sous-catégorie(s). Supprimer quand même ?`,
      )
    )
      return;
    setCategories((s) => s.filter((c) => c.id !== id));
    toast.success("Catégorie supprimée.");
  }

  // Sous-catégorie CRUD
  function handleAddSousCategorie(
    categorieId: string,
    v: Omit<SousCategorie, "id">,
  ) {
    setCategories((s) =>
      s.map((c) =>
        c.id === categorieId
          ? {
              ...c,
              sousCategories: [...c.sousCategories, { id: nanoid(), ...v }],
            }
          : c,
      ),
    );
  }

  function handleEditSousCategorie(
    categorieId: string,
    scId: string,
    v: Omit<SousCategorie, "id">,
  ) {
    setCategories((s) =>
      s.map((c) =>
        c.id === categorieId
          ? {
              ...c,
              sousCategories: c.sousCategories.map((sc) =>
                sc.id === scId ? { ...sc, ...v } : sc,
              ),
            }
          : c,
      ),
    );
  }

  function handleDeleteSousCategorie(categorieId: string, scId: string) {
    setCategories((s) =>
      s.map((c) =>
        c.id === categorieId
          ? {
              ...c,
              sousCategories: c.sousCategories.filter((sc) => sc.id !== scId),
            }
          : c,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {/* Modals */}
      <CategorieModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddCategorie}
      />
      {editTarget && (
        <CategorieModal
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          defaultValues={editTarget}
          onSubmit={handleEditCategorie}
        />
      )}

      <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
          <Heading>Catégories &amp; Sous-catégories</Heading>
          <Button
            variant="amber"
            size="sm"
            className="rounded-md gap-1.5 text-[13px] h-8"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" /> Ajouter une catégorie
          </Button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-input dark:border-neutral-700 bg-slate-50/40 dark:bg-neutral-800/10">
          <Tag className="size-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
          <Input
            placeholder="Rechercher une catégorie…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-7 max-w-[220px] text-[12px] rounded-md"
          />
          <span className="text-[11px] text-neutral-400 ml-auto">
            {filteredCategories.length} catégorie
            {filteredCategories.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* List */}
        {filteredCategories.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-neutral-400">
            Aucune catégorie trouvée.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
            {filteredCategories.map((c) => (
              <div key={c.id}>
                {/* Catégorie row */}
                <div
                  className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-neutral-800/20 transition-colors ${
                    expandedIds.has(c.id)
                      ? "bg-slate-50/40 dark:bg-neutral-800/10"
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
                    {/* Color dot + icon */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.couleur && (
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ background: c.couleur }}
                        />
                      )}
                      {c.icone && (
                        <span className="text-base leading-none">
                          {c.icone}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                        {c.nom}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                        /{c.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge>
                      {c.visibilite.charAt(0).toUpperCase() +
                        c.visibilite.slice(1)}
                    </Badge>
                    <Badge>{c.statut === "actif" ? "Actif" : "Inactif"}</Badge>
                    <Badge>{c.sousCategories.length} sous-cat.</Badge>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md"
                      onClick={() => setEditTarget(c)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDeleteCategorie(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Sous-catégories accordion */}
                {expandedIds.has(c.id) && (
                  <SousCategoriesSection
                    categorieId={c.id}
                    sousCategories={c.sousCategories}
                    onAdd={handleAddSousCategorie}
                    onEdit={handleEditSousCategorie}
                    onDelete={handleDeleteSousCategorie}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
