import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import {
  Ban,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  Trash2,
  X,
} from "lucide-react";

import type { Business } from "@lokale/types/business";

import PanelIntro from "#/components/sheet/panel-intro";
import DetailField from "#/components/ui/detail-field";

interface BusinessDetailProps {
  business: Business;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onToggleStatus: () => void;
  isDeleting?: boolean;
  isTogglingStatus?: boolean;
}

export function BusinessDetail({
  business,
  onEdit,
  onDelete,
  onClose,
  onToggleStatus,
  isDeleting,
  isTogglingStatus,
}: BusinessDetailProps) {
  const busy = isDeleting || isTogglingStatus;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Building2}
        title={business.name}
        subtitle={`/${business.slug}`}
        onClose={onClose}
      />

      {business.description && (
        <p className="px-4 pb-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          {business.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 p-4">
        <DetailField
          icon={MapPin}
          label="Ville"
          value={business.city || "—"}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Phone}
          label="Téléphone"
          value={business.phone || "—"}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Mail}
          label="Email"
          value={business.email || "—"}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Building2}
          label="Propriétaire"
          value={business.owner.name}
          className="bg-neutral-500/10 p-3 rounded-sm"
        />
      </div>

      <Separator className="dark:bg-neutral-800 shrink-0" />

      <div className="grid grid-cols-1 gap-2 p-4">
        <Link to="/workspace/business/$id/manage" params={{ id: business.id }}>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-md gap-1.5 w-full"
            disabled={busy}
          >
            <Settings className="size-3.5" /> Configurer la page
          </Button>
        </Link>

        {business.status === "ACTIVE" ? (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-md gap-1.5"
            onClick={onToggleStatus}
            disabled={busy}
          >
            {isTogglingStatus ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Ban className="size-3.5" />
            )}{" "}
            Suspendre
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-md gap-1.5"
            onClick={onToggleStatus}
            disabled={busy}
          >
            {isTogglingStatus ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}{" "}
            Activer
          </Button>
        )}

        <Button
          variant="amber"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onEdit}
          disabled={busy}
        >
          <Pencil className="size-3.5" /> Modifier
        </Button>
        <Button
          variant="error"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onDelete}
          disabled={busy}
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
          disabled={busy}
        >
          <X /> Fermer
        </Button>
      </div>
    </div>
  );
}
