import Input from "#/components/input/input";
import Heading from "#/components/typography/heading";
import { Button } from "#/components/ui/button";
import DetailField from "#/components/ui/detail-field";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Storage() {
  const used = 34.2;
  const total = 100;
  const pct = (used / total) * 100;

  return (
    <div className="space-y-6">
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading>Utilisation du stockage</Heading>
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-neutral-800 dark:text-white">
              {used} Go
            </span>
            <span className="text-sm text-neutral-400 dark:text-neutral-500">
              / {total} Go
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-amber-100/50 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-100 mt-2">
            {pct.toFixed(0)}% utilisé — {total - used} Go disponibles
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Images", size: "14.2 Go", color: "bg-blue-400", pct: 41 },
            {
              label: "Vidéos",
              size: "12.8 Go",
              color: "bg-violet-400",
              pct: 37,
            },
            {
              label: "Documents",
              size: "7.2 Go",
              color: "bg-amber-400",
              pct: 21,
            },
          ].map((cat) => (
            <div
              key={cat.label}
              className="p-3 rounded-md border border-input dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40"
            >
              <div className={`size-2 rounded-full ${cat.color} mb-2`} />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                {cat.size}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {cat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="border py-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading className="px-3">Limites & Nettoyage</Heading>
        <div className="divide-y divide-input dark:divide-neutral-700">
          <div className="px-3">
            <DetailField
              label="Taille max par fichier"
              value="Limite appliquée à tous les uploads utilisateurs."
            >
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="10"
                  value=""
                  onChange={() => {}}
                  type="number"
                  className="h-9 rounded-md w-20"
                />
                <span className="text-sm text-neutral-400">Mo</span>
              </div>
            </DetailField>
          </div>
          <div className="px-3">
            <DetailField
              label="Stockage max par workspace"
              value="Quota alloué à chaque espace entreprise."
            >
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="500"
                  value=""
                  onChange={() => {}}
                  type="number"
                  className="h-9 rounded-md w-20"
                />
                <span className="text-sm text-neutral-400">Mo</span>
              </div>
            </DetailField>
          </div>
        </div>
        <div className="flex justify-between gap-3 pt-4 mt-2 border-t border-input dark:border-neutral-700 px-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md gap-2 text-sm"
            onClick={() => toast("Nettoyage des fichiers orphelins lancé.")}
          >
            <Trash2 className="size-3.5" /> Nettoyer les fichiers orphelins
          </Button>
          <Button
            variant="amber"
            size="sm"
            className="rounded-md gap-2 text-sm ml-auto"
            onClick={() => toast.success("Limites enregistrées.")}
          >
            <Save className="size-3.5" /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
