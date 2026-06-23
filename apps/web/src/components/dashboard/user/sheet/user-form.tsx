import Heading from "#/components/typography/heading";
import {
  FormField,
  FormInput,
  FormSelect,
  FormToggle,
} from "#/components/ui/form";
import { Separator } from "#/components/ui/separator";
import {
  Plan,
  Role,
  UserStatus,
  type AdminUsers,
  type UserFormData,
} from "#/types/user";
import { Loader2, Save, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface UserFormProps {
  mode: "create" | "edit";
  user?: AdminUsers;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}

export const DEFAULT_FORM: UserFormData = {
  name: "",
  email: "",
  phone: "",
  role: Role.USER,
  status: UserStatus.ACTIVE,
  plan: Plan.FREE,
  country: "Congo",
  city: "",
  emailVerified: false,
  idVerified: false,
};

export default function UserForm({
  mode,
  user,
  onClose,
  onSave,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>(
    mode === "edit" && user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          plan: user.plan,
          country: user.country,
          city: user.city,
          emailVerified: user.emailVerified,
          idVerified: user.idVerified,
        }
      : DEFAULT_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof UserFormData>(k: K, v: UserFormData[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  function validateForm(
    data: UserFormData,
  ): Partial<Record<keyof UserFormData, string>> {
    const errors: Partial<Record<keyof UserFormData, string>> = {};
    if (!data.name.trim()) errors.name = "Le nom est requis";
    if (!data.email.trim()) errors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Email invalide";
    if (!data.phone.trim()) errors.phone = "Le téléphone est requis";
    if (!data.city.trim()) errors.city = "La ville est requise";
    return errors;
  }

  async function handleSubmit() {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave(form);
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <UserPlus className="size-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {mode === "create"
                ? "Nouvel utilisateur"
                : "Modifier l'utilisateur"}
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {mode === "create" ? "Remplissez les informations" : user?.name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="size-7 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator className="dark:bg-neutral-800 shrink-0" />

      <div className="px-5 py-4 flex flex-col gap-5 flex-1">
        <div>
          <Heading>Identité</Heading>
          <div className="flex flex-col gap-3">
            <FormField label="Nom complet" error={errors.name}>
              <FormInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="Ex: Jean Dupont"
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <FormInput
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="email@exemple.com"
                type="email"
              />
            </FormField>
            <FormField label="Téléphone" error={errors.phone}>
              <FormInput
                value={form.phone}
                onChange={(v) => set("phone", v)}
                placeholder="+242 06 000 0000"
              />
            </FormField>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Localisation */}
        <div>
          <Heading>Localisation</Heading>
          <div className="flex flex-col gap-3">
            <FormField label="Pays" error={errors.country}>
              <FormInput
                value={form.country}
                onChange={(v) => set("country", v)}
                placeholder="Pays"
              />
            </FormField>
            <FormField label="Ville" error={errors.city}>
              <FormInput
                value={form.city}
                onChange={(v) => set("city", v)}
                placeholder="Ville"
              />
            </FormField>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Rôle & Plan */}
        <div>
          <Heading>Rôle & Plan</Heading>
          <div className="flex flex-col gap-3">
            <FormField label="Rôle">
              <FormSelect
                value={form.role}
                onChange={(v) => set("role", v as Role)}
                options={[
                  { value: Role.USER, label: "Utilisateur" },
                  { value: Role.WORKSPACE, label: "Entreprise" },
                  { value: Role.ADMIN, label: "Admin" },
                ]}
              />
            </FormField>
            <FormField label="Plan">
              <FormSelect
                value={form.plan}
                onChange={(v) => set("plan", v as Plan)}
                options={[
                  { value: Plan.FREE, label: "Free" },
                  { value: Plan.PRO, label: "Pro" },
                  { value: Plan.BUSINESS, label: "Business" },
                ]}
              />
            </FormField>
            <FormField label="Statut">
              <FormSelect
                value={form.status}
                onChange={(v) => set("status", v as UserStatus)}
                options={[
                  { value: UserStatus.ACTIVE, label: "Actif" },
                  { value: UserStatus.PENDING, label: "En attente" },
                  { value: UserStatus.SUSPENDED, label: "Suspendu" },
                  { value: UserStatus.BANNED, label: "Banni" },
                ]}
              />
            </FormField>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />
        <div>
          <Heading>Vérifications</Heading>
          <div className="flex flex-col">
            <FormToggle
              checked={form.emailVerified}
              onChange={(v) => set("emailVerified", v)}
              label="Email vérifié"
            />
            <FormToggle
              checked={form.idVerified}
              onChange={(v) => set("idVerified", v)}
              label="Identité vérifiée"
            />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-4 border-t border-input dark:border-neutral-800 flex items-center gap-2 shrink-0">
        <button
          onClick={onClose}
          className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-neutral-700 text-[13px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 h-9 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving
            ? "Enregistrement…"
            : mode === "create"
              ? "Créer"
              : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
