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
  X,
  ArrowUpDown,
  MapPin,
  Flag,
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
import { Badge } from "#/components/ui/badge";
import Heading from "#/components/typography/heading";

type VilleType = "Capitale" | "Métropole" | "Ville" | "Village";
type Statut = "actif" | "inactif";
type Continent =
  | "Afrique"
  | "Europe"
  | "Amérique du Nord"
  | "Amérique du Sud"
  | "Asie"
  | "Océanie";

interface Ville {
  id: string;
  nom: string;
  region: string;
  type: VilleType;
  statut: Statut;
  population?: number;
}

interface Pays {
  id: string;
  nom: string;
  code: string;
  drapeau: string;
  continent: string;
  indicatif: string;
  devise: string;
  villes: Ville[];
}

// ─── Pill config ──────────────────────────────────────────────────────────────

const VILLE_TYPE_CLASS: Record<VilleType, string> = {
  Capitale:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  Métropole: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  Ville:
    "bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-400",
  Village:
    "bg-slate-100 text-slate-500 dark:bg-neutral-700/40 dark:text-neutral-500",
};

const STATUT_CLASS: Record<Statut, string> = {
  actif:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  inactif: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
};

const CONTINENTS: Continent[] = [
  "Afrique",
  "Europe",
  "Amérique du Nord",
  "Amérique du Sud",
  "Asie",
  "Océanie",
];

const VILLE_TYPES: VilleType[] = ["Capitale", "Métropole", "Ville", "Village"];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SEED: Pays[] = [
  {
    id: "p1",
    nom: "République du Congo",
    code: "CG",
    drapeau: "🇨🇬",
    continent: "Afrique",
    indicatif: "+242",
    devise: "XAF",
    villes: [
      {
        id: "v1",
        nom: "Brazzaville",
        region: "Pool",
        type: "Capitale",
        statut: "actif",
        population: 2230000,
      },
      {
        id: "v2",
        nom: "Pointe-Noire",
        region: "Kouilou",
        type: "Métropole",
        statut: "actif",
        population: 1200000,
      },
    ],
  },
  {
    id: "p2",
    nom: "France",
    code: "FR",
    drapeau: "🇫🇷",
    continent: "Europe",
    indicatif: "+33",
    devise: "EUR",
    villes: [
      {
        id: "v3",
        nom: "Paris",
        region: "Île-de-France",
        type: "Capitale",
        statut: "actif",
        population: 2161000,
      },
    ],
  },
];

// ─── Shared field error ───────────────────────────────────────────────────────

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;
  return <p className="text-[11px] text-red-500 mt-0.5">{errors.join(", ")}</p>;
}

// ─── PaysForm (TanStack Form) ─────────────────────────────────────────────────

interface PaysFormProps {
  defaultValues?: Pays;
  onSubmit: (values: Omit<Pays, "id" | "villes">) => void;
  onCancel: () => void;
}

function PaysForm({ defaultValues, onSubmit, onCancel }: PaysFormProps) {
  const form = useForm({
    defaultValues: {
      nom: defaultValues?.nom ?? "",
      code: defaultValues?.code ?? "",
      drapeau: defaultValues?.drapeau ?? "",
      continent: defaultValues?.continent ?? "",
      indicatif: defaultValues?.indicatif ?? "",
      devise: defaultValues?.devise ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        nom: value.nom.trim(),
        code: value.code.trim().toUpperCase(),
        drapeau: value.drapeau.trim(),
        continent: value.continent.trim(),
        indicatif: value.indicatif.trim(),
        devise: value.devise.trim(),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="p-3 border-b border-input dark:border-neutral-700 bg-slate-50/60 dark:bg-neutral-800/20"
    >
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-3">
        {defaultValues ? "Modifier le pays" : "Nouveau pays"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Nom */}
        <form.Field
          name="nom"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "Nom obligatoire" : undefined,
          }}
        >
          {(field) => (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Nom *
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: République du Congo"
                className="h-8 text-[13px] rounded-md"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {/* Code */}
        <form.Field
          name="code"
          validators={{
            onChange: ({ value }) =>
              value.trim().length !== 2 ? "2 lettres exactement" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Code ISO *
              </label>
              <Input
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value.toUpperCase())
                }
                onBlur={field.handleBlur}
                placeholder="CG"
                // maxLength={2}
                className="h-8 text-[13px] rounded-md uppercase"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {/* Drapeau */}
        <form.Field name="drapeau">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Drapeau (emoji)
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="🇨🇬"
                className="h-8 text-[13px] rounded-md"
              />
            </div>
          )}
        </form.Field>

        {/* Continent */}
        <form.Field name="continent">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Continent
              </label>
              <Select
                value={field.state.value}
                // onValueChange={(value: string) =>
                //   field.handleChange(value as unknown as Continent)
                // }
              >
                <SelectTrigger className="h-8 text-[13px] rounded-md">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {CONTINENTS.map((c) => (
                    <SelectItem key={c} value={c} className="text-[13px]">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Indicatif */}
        <form.Field name="indicatif">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Indicatif
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+242"
                className="h-8 text-[13px] rounded-md"
              />
            </div>
          )}
        </form.Field>

        {/* Devise */}
        <form.Field name="devise">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Devise
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="XAF"
                className="h-8 text-[13px] rounded-md"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-md text-[12px] gap-1.5"
          onClick={onCancel}
        >
          <X className="size-3" /> Annuler
        </Button>
        <Button
          type="submit"
          variant="amber"
          size="sm"
          className="h-7 rounded-md text-[12px] gap-1.5"
        >
          <Save className="size-3" />{" "}
          {defaultValues ? "Modifier" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

// ─── VilleForm (TanStack Form) ────────────────────────────────────────────────

interface VilleFormProps {
  defaultValues?: Ville;
  onSubmit: (values: Omit<Ville, "id">) => void;
  onCancel: () => void;
}

function VilleForm({ defaultValues, onSubmit, onCancel }: VilleFormProps) {
  const form = useForm({
    defaultValues: {
      nom: defaultValues?.nom ?? "",
      region: defaultValues?.region ?? "",
      type: defaultValues?.type ?? ("Ville" as VilleType),
      statut: defaultValues?.statut ?? ("actif" as Statut),
      population: defaultValues?.population ?? ("" as unknown as number),
    },
    onSubmit: ({ value }) => {
      onSubmit({
        nom: value.nom.trim(),
        region: value.region.trim(),
        type: value.type,
        statut: value.statut,
        population: value.population ? Number(value.population) : undefined,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="px-3 py-2.5 border-b border-input dark:border-neutral-700 bg-blue-50/30 dark:bg-blue-500/5"
    >
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
        {defaultValues ? "Modifier la ville" : "Nouvelle ville"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Nom */}
        <form.Field
          name="nom"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "Nom obligatoire" : undefined,
          }}
        >
          {(field) => (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Nom *
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Brazzaville"
                className="h-7 text-[12px] rounded-md"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {/* Région */}
        <form.Field name="region">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Région
              </label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="ex: Pool"
                className="h-7 text-[12px] rounded-md"
              />
            </div>
          )}
        </form.Field>

        {/* Type */}
        <form.Field name="type">
          {(field) => (
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Type
              </label>
              <Select
                value={field.state.value}
                // onValueChange={(v: VilleType) => field.handleChange(v)}
              >
                <SelectTrigger className="h-7 text-[12px] rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VILLE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-[12px]">
                      {t}
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
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Statut
              </label>
              <Select
                value={field.state.value}
                // onValueChange={(v: Statut) => field.handleChange(v)}
              >
                <SelectTrigger className="h-7 text-[12px] rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif" className="text-[12px]">
                    Actif
                  </SelectItem>
                  <SelectItem value="inactif" className="text-[12px]">
                    Inactif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Population */}
        <form.Field name="population">
          {(field) => (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                Population
              </label>
              <Input
                type="number"
                value={field.state.value as unknown as string}
                onChange={(e) =>
                  field.handleChange(e.target.value as unknown as number)
                }
                placeholder="ex: 2 000 000"
                className="h-7 text-[12px] rounded-md"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 rounded-md text-[11px] gap-1"
          onClick={onCancel}
        >
          <X className="size-3" /> Annuler
        </Button>
        <Button
          type="submit"
          variant="amber"
          size="sm"
          className="h-6 rounded-md text-[11px] gap-1"
        >
          <Save className="size-3" /> {defaultValues ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

// ─── VillesSection (TanStack Table) ──────────────────────────────────────────

interface VillesSectionProps {
  paysId: string;
  villes: Ville[];
  onAdd: (paysId: string, v: Omit<Ville, "id">) => void;
  onEdit: (paysId: string, villeId: string, v: Omit<Ville, "id">) => void;
  onDelete: (paysId: string, villeId: string) => void;
}

function VillesSection({
  paysId,
  villes,
  onAdd,
  onEdit,
  onDelete,
}: VillesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Ville>[]>(
    () => [
      {
        accessorKey: "nom",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ville <ArrowUpDown className="size-2.5" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-200">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "region",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Région
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {getValue<string>() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Type
          </span>
        ),
        cell: ({ getValue }) => {
          const t = getValue<VilleType>();
          return <Badge className={VILLE_TYPE_CLASS[t]}>{t}</Badge>;
        },
      },
      {
        accessorKey: "population",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Population
          </span>
        ),
        cell: ({ getValue }) => {
          const v = getValue<number | undefined>();
          return (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {v ? v.toLocaleString("fr-FR") : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "statut",
        header: () => (
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Statut
          </span>
        ),
        cell: ({ getValue }) => {
          const s = getValue<Statut>();
          return (
            <Badge className={STATUT_CLASS[s]}>
              {s === "actif" ? "Actif" : "Inactif"}
            </Badge>
          );
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
              onClick={() => {
                setEditId(row.original.id);
                setShowAddForm(false);
              }}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => {
                onDelete(paysId, row.original.id);
                toast.success("Ville supprimée.");
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ),
      },
    ],
    [paysId, onDelete],
  );

  const table = useReactTable({
    data: villes,
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
      {/* Add form */}
      {showAddForm && (
        <VilleForm
          onSubmit={(v) => {
            onAdd(paysId, v);
            setShowAddForm(false);
            toast.success("Ville ajoutée.");
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit form */}
      {editId && (
        <VilleForm
          defaultValues={villes.find((v) => v.id === editId)}
          onSubmit={(v) => {
            onEdit(paysId, editId, v);
            setEditId(null);
            toast.success("Ville modifiée.");
          }}
          onCancel={() => setEditId(null)}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/40 dark:bg-neutral-800/10">
        <MapPin className="size-3 text-neutral-300 dark:text-neutral-600 shrink-0" />
        <Input
          placeholder="Filtrer les villes…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-6 max-w-[180px] text-[11px] rounded-md border-input dark:border-neutral-700"
        />
        <span className="text-[11px] text-neutral-400 ml-auto">
          {table.getRowModel().rows.length} ville
          {table.getRowModel().rows.length !== 1 ? "s" : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 rounded-md text-[11px] gap-1 border-input dark:border-neutral-700"
          onClick={() => {
            setShowAddForm(true);
            setEditId(null);
          }}
        >
          <Plus className="size-3" /> Ajouter une ville
        </Button>
      </div>

      {/* Empty state */}
      {villes.length === 0 && !showAddForm ? (
        <div className="px-3 py-4 text-center text-[12px] text-neutral-400">
          Aucune ville —{" "}
          <button
            className="text-amber-500 hover:text-amber-600 font-medium"
            onClick={() => setShowAddForm(true)}
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

export default function GeoManager() {
  const [pays, setPays] = useState<Pays[]>(SEED);
  const [showPaysForm, setShowPaysForm] = useState(false);
  const [editPaysId, setEditPaysId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["p1"]));
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredPays = useMemo(
    () =>
      pays.filter(
        (p) =>
          p.nom.toLowerCase().includes(globalFilter.toLowerCase()) ||
          p.code.toLowerCase().includes(globalFilter.toLowerCase()),
      ),
    [pays, globalFilter],
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Pays CRUD
  function handleAddPays(v: Omit<Pays, "id" | "villes">) {
    setPays((s) => [...s, { id: nanoid(), ...v, villes: [] }]);
    setShowPaysForm(false);
    toast.success("Pays ajouté.");
  }

  function handleEditPays(v: Omit<Pays, "id" | "villes">) {
    setPays((s) => s.map((p) => (p.id === editPaysId ? { ...p, ...v } : p)));
    setEditPaysId(null);
    toast.success("Pays modifié.");
  }

  function handleDeletePays(id: string) {
    const count = pays.find((p) => p.id === id)?.villes.length ?? 0;
    if (
      count > 0 &&
      !confirm(`Ce pays a ${count} ville(s). Supprimer quand même ?`)
    )
      return;
    setPays((s) => s.filter((p) => p.id !== id));
    toast.success("Pays supprimé.");
  }

  // Villes CRUD
  function handleAddVille(paysId: string, v: Omit<Ville, "id">) {
    setPays((s) =>
      s.map((p) =>
        p.id === paysId
          ? { ...p, villes: [...p.villes, { id: nanoid(), ...v }] }
          : p,
      ),
    );
  }

  function handleEditVille(
    paysId: string,
    villeId: string,
    v: Omit<Ville, "id">,
  ) {
    setPays((s) =>
      s.map((p) =>
        p.id === paysId
          ? {
              ...p,
              villes: p.villes.map((vi) =>
                vi.id === villeId ? { ...vi, ...v } : vi,
              ),
            }
          : p,
      ),
    );
  }

  function handleDeleteVille(paysId: string, villeId: string) {
    setPays((s) =>
      s.map((p) =>
        p.id === paysId
          ? { ...p, villes: p.villes.filter((v) => v.id !== villeId) }
          : p,
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div className="border border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-input dark:border-neutral-700">
          <Heading>Pays &amp; Villes</Heading>
          <Button
            variant="amber"
            size="sm"
            className="rounded-md gap-1.5 text-[13px] h-8"
            onClick={() => {
              setShowPaysForm(true);
              setEditPaysId(null);
            }}
          >
            <Plus className="size-3.5" /> Ajouter un pays
          </Button>
        </div>

        {/* Add pays form */}
        {showPaysForm && (
          <PaysForm
            onSubmit={handleAddPays}
            onCancel={() => setShowPaysForm(false)}
          />
        )}

        {/* Search bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-input dark:border-neutral-700 bg-slate-50/40 dark:bg-neutral-800/10">
          <Flag className="size-3.5 text-neutral-300 dark:text-neutral-600 shrink-0" />
          <Input
            placeholder="Rechercher un pays…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-7 max-w-[220px] text-[12px] rounded-md"
          />
          <span className="text-[11px] text-neutral-400 ml-auto">
            {filteredPays.length} pays
          </span>
        </div>

        {/* List */}
        {filteredPays.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-neutral-400">
            Aucun pays trouvé.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
            {filteredPays.map((p) => (
              <div key={p.id}>
                {/* Edit form inline */}
                {editPaysId === p.id && (
                  <PaysForm
                    defaultValues={p}
                    onSubmit={handleEditPays}
                    onCancel={() => setEditPaysId(null)}
                  />
                )}

                {/* Pays row */}
                <div
                  className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-neutral-800/20 transition-colors ${
                    expandedIds.has(p.id)
                      ? "bg-slate-50/40 dark:bg-neutral-800/10"
                      : ""
                  }`}
                  onClick={() => toggleExpand(p.id)}
                >
                  {expandedIds.has(p.id) ? (
                    <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 text-neutral-400 shrink-0" />
                  )}

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {p.drapeau && (
                      <span className="text-lg leading-none">{p.drapeau}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                        {p.nom}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {p.code}
                        {p.continent ? ` · ${p.continent}` : ""}
                        {p.indicatif ? ` · ${p.indicatif}` : ""}
                        {p.devise ? ` · ${p.devise}` : ""}
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400 shrink-0">
                    {p.villes.length} ville{p.villes.length !== 1 ? "s" : ""}
                  </Badge>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md"
                      onClick={() =>
                        setEditPaysId(editPaysId === p.id ? null : p.id)
                      }
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDeletePays(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Villes accordion */}
                {expandedIds.has(p.id) && (
                  <VillesSection
                    paysId={p.id}
                    villes={p.villes}
                    onAdd={handleAddVille}
                    onEdit={handleEditVille}
                    onDelete={handleDeleteVille}
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
