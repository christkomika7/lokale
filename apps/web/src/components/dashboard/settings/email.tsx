import Input from "#/components/input/input";
import Heading from "#/components/typography/heading";
import { Button } from "#/components/ui/button";
import DetailField from "#/components/ui/detail-field";
import { Mail, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Emails() {
  const [testLoading, setTestLoading] = useState(false);

  async function handleTest() {
    setTestLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTestLoading(false);
    toast.success("Email de test envoyé avec succès !");
  }

  return (
    <div className="space-y-6">
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading>Configuration SMTP</Heading>
        <div className="divide-y divide-slate-50 dark:divide-neutral-800">
          <DetailField
            label="Hôte SMTP"
            value="Adresse du serveur de messagerie."
            layout="row"
          >
            <Input
              placeholder="smtp.gmail.com"
              value=""
              onChange={() => {}}
              className="h-9 rounded-md min-w-xs"
            />
          </DetailField>
          <DetailField
            label="Port"
            value="Port de connexion SMTP (465 pour SSL, 587 pour TLS)."
            layout="row"
          >
            <Input
              placeholder="587"
              type="number"
              value=""
              onChange={() => {}}
              className="h-9 rounded-md min-w-xs"
            />
          </DetailField>
          <DetailField
            label="Nom d'utilisateur"
            value="Identifiant de connexion SMTP."
            layout="row"
          >
            <Input
              placeholder="no-reply@awa.cg"
              value=""
              onChange={() => {}}
              className="h-9 rounded-md min-w-xs"
            />
          </DetailField>
          <DetailField
            label="Mot de passe SMTP"
            value="Mot de passe de connexion SMTP."
            layout="row"
          >
            <Input
              type="password"
              placeholder="••••••••••••"
              value=""
              onChange={() => {}}
              className="h-9 rounded-md min-w-xs"
            />
          </DetailField>
          <DetailField
            label="Nom d'expéditeur"
            value="Nom affiché dans les emails envoyés."
            layout="row"
          >
            <Input
              placeholder="Awa Platform"
              value=""
              onChange={() => {}}
              className="h-9 rounded-md min-w-xs"
            />
          </DetailField>
        </div>
        <div className="flex items-center gap-3 pt-4 mt-2 border-t border-input dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md gap-2 border-input dark:border-neutral-700 text-sm"
            onClick={handleTest}
            disabled={testLoading}
          >
            {testLoading ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Mail className="size-3.5" />
            )}
            Tester la connexion
          </Button>
          <Button
            variant="amber"
            size="sm"
            className="rounded-md gap-2 text-sm ml-auto"
            onClick={() => toast.success("SMTP enregistré.")}
          >
            <Save className="size-3.5" /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
