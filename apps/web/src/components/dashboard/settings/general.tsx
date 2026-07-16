import AlertMessage from "#/components/alert/alert-message";
import Heading from "#/components/typography/heading";
import DetailField from "#/components/ui/detail-field";
import { Switch } from "#/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

export default function General() {
  const [maintenance, setMaintenance] = useState(false);
  const [lang, setLang] = useState("fr");
  const [currency, setCurrency] = useState("FCFA");

  return (
    <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
      <Heading>Mode maintenance</Heading>
      <DetailField
        layout="row"
        label="Activer le mode maintenance"
        value="Met la plateforme hors ligne pour les utilisateurs. Les admins conservent l'accès."
      >
        <div className="flex items-end h-full gap-3">
          <Switch
            checked={maintenance}
            onCheckedChange={(v) => {
              setMaintenance(v);
              toast(
                v
                  ? "⚠️ Mode maintenance activé"
                  : "✅ Plateforme remise en ligne",
              );
            }}
          />
        </div>
      </DetailField>
      {maintenance && (
        <AlertMessage
          type="warning"
          title="Mode maintenance activé"
          description="La plateforme est actuellement inaccessible aux utilisateurs."
        />
      )}
    </div>
  );
}
