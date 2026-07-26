import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import {
  Hash,
  Layers,
  Loader2,
  Palette,
  Pencil,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react";

import type { Category } from "@lokale/types/category";

import PanelIntro from "#/components/sheet/panel-intro";
import DetailField from "#/components/ui/detail-field";

interface CategoryDetailProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export function CategoryDetail({
  category,
  onEdit,
  onDelete,
  onClose,
  isDeleting,
}: CategoryDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Layers}
        title={category.name}
        subtitle={`/${category.slug}`}
        onClose={onClose}
      />

      {category.description && (
        <p className="px-4 pb-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          {category.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 p-4">
        <DetailField
          icon={Layers}
          label="Sous-catégories"
          value={
            category.subCategories.length +
            " sous-cat" +
            (category.subCategories.length !== 1 ? "s" : "")
          }
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Hash}
          label="Slug"
          value={category.slug}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Palette}
          label="Couleur"
          value={category.color || "—"}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={SmilePlus}
          label="Icône"
          value={category.icon || "—"}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
      </div>

      <Separator className="dark:bg-neutral-800 shrink-0" />

      <div className="grid grid-cols-1 gap-2 p-4">
        <Button
          variant="amber"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onEdit}
          disabled={isDeleting}
        >
          <Pencil className="size-3.5" /> Modifier
        </Button>
        <Button
          variant="error"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}{" "}
          Supprimer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onClose}
          disabled={isDeleting}
        >
          <X /> Fermer
        </Button>
      </div>
    </div>
  );
}
