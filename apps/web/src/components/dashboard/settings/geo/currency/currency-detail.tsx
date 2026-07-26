import PanelIntro from "#/components/sheet/panel-intro";
import DetailField from "#/components/ui/detail-field";
import { Button } from "#/components/ui/button";
import { Coins, Hash, Loader2, Pencil, Trash2, Wallet, X } from "lucide-react";

import type { Currency } from "@lokale/types/localisation";

interface CurrencyDetailProps {
  currency: Currency;
  countryCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export function CurrencyDetail({
  currency,
  countryCount,
  onEdit,
  onDelete,
  onClose,
  isDeleting,
}: CurrencyDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Wallet}
        title={currency.name}
        subtitle={countryCount + " pays" + (countryCount !== 1 ? "s" : "")}
        onClose={onClose}
      />
      <div className="grid grid-cols-2 gap-2 p-4">
        <DetailField
          icon={Hash}
          label="Code ISO"
          value={currency.code}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Coins}
          label="Symbole"
          value={currency.symbol}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
      </div>

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
