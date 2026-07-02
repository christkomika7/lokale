import Heading from "#/components/typography/heading";
import { Separator } from "#/components/ui/separator";
import { Plan, Role, type User, type UserSchemaType } from "@lokale/types/user";
import { useForm } from "@tanstack/react-form";
import {
  BadgeDollarSign,
  Globe2,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCog,
  UserIcon,
  UserPlus,
  X,
} from "lucide-react";
import { userSchema } from "@lokale/lib/validator/user";
import { Label } from "#/components/ui/label";
import Input from "#/components/input/input";
import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Combobox } from "#/components/select/combobox";
import { congoCities } from "#/data/city";
import { Button } from "#/components/ui/button";
import { Switch } from "#/components/ui/switch";
import { cn } from "#/lib/utils";
import ErrorMessage from "#/components/message/error-message";
import { useState } from "react";
import { useApiMutation } from "#/hook/use-api-mutation";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";
import { toast } from "sonner";
import { queryClient } from "#/lib/query-client";

interface UserFormProps {
  mode: "create" | "edit";
  user?: User;
  onClose: () => void;
}

export const DEFAULT_FORM: UserSchemaType = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  role: Role.USER,
  plan: Plan.FREE,
  password: "",
  city: "",
  emailVerified: false,
};

export default function UserForm({ mode, user, onClose }: UserFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const updateUser = useApiMutation<User, UserSchemaType>(
    () => `/admin/users/${user?.id}`,
    {
      method: "patch",
      invalidate: ["admin-user"],
      successMessage: "Utilisateur mis à jour",
    },
  );

  const createUser = useApiMutation<User, UserSchemaType>("/admin/users", {
    method: "post",
  });

  const form = useForm({
    defaultValues:
      mode === "edit" && user
        ? {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone ?? "",
            role: user.role,
            plan: user.plan,
            password: "",
            city: user.city ?? "",
            emailVerified: user.emailVerified,
          }
        : DEFAULT_FORM,
    validators: { onSubmit: userSchema },
    onSubmit: async ({ value }) => {
      setGlobalError("");
      if (mode === "create") {
        createUser.mutate(value as UserSchemaType, {
          onError: (err) => {
            console.log(err);
            setGlobalError(getAuthErrorMessage(err));
          },
          onSuccess: () => {
            toast.success(
              `${value.firstname} ${value.lastname} a été ajouté avec succès`,
              {
                description:
                  "Un lien de vérification a été envoyé à son adresse email. Le compte sera actif dès validation.",
                duration: 5000,
              },
            );
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            onClose();
          },
        });
      } else {
        updateUser.mutate(value as UserSchemaType, {
          onError: (err) =>
            setGlobalError(err?.message ?? "Erreur lors de la mise à jour"),
          onSuccess: () => {
            onClose();
          },
        });
      }
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-sm bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <UserPlus className="size-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {mode === "create"
                ? "Nouvel utilisateur"
                : "Modifier l'utilisateur"}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-300">
              {mode === "create" ? "Remplissez les informations" : user?.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-7 rounded-sm flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator className="dark:bg-neutral-800 shrink-0" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
        className="px-5 py-4 flex flex-col gap-4 flex-1"
      >
        {/* Identité */}
        <div>
          <Heading>Identité</Heading>
          <div className="flex flex-col gap-3">
            <form.Field name="lastname">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Nom</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Moukoko"
                    icon={UserIcon}
                    value={field.state.value}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="family-name"
                    className="min-w-auto w-full rounded-lg"
                  />
                  <InputErrorContainer>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.map((error) => (
                        <InputErrorMessage
                          key={error?.message}
                          message={error?.message}
                        />
                      ))}
                  </InputErrorContainer>
                </div>
              )}
            </form.Field>

            <form.Field name="firstname">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Prénom</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Jean-Baptiste"
                    icon={UserIcon}
                    value={field.state.value}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="given-name"
                    className="min-w-auto w-full rounded-lg"
                  />
                  <InputErrorContainer>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.map((error) => (
                        <InputErrorMessage
                          key={error?.message}
                          message={error?.message}
                        />
                      ))}
                  </InputErrorContainer>
                </div>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Adresse email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="vous@exemple.com"
                    icon={Mail}
                    value={field.state.value}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="email"
                    className="min-w-auto w-full rounded-lg"
                  />
                  <InputErrorContainer>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.map((error) => (
                        <InputErrorMessage
                          key={error?.message}
                          message={error?.message}
                        />
                      ))}
                  </InputErrorContainer>
                </div>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Numéro de téléphone</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    placeholder="+242 06 000 0000"
                    icon={Phone}
                    value={field.state.value}
                    hasError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="tel"
                    className="min-w-auto w-full rounded-lg"
                  />
                  <InputErrorContainer>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.map((error) => (
                        <InputErrorMessage
                          key={error?.message}
                          message={error?.message}
                        />
                      ))}
                  </InputErrorContainer>
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Localisation */}
        <div>
          <Heading>Localisation</Heading>
          <form.Field name="city">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Ville</Label>
                <Combobox
                  items={congoCities}
                  value={field.state.value ?? ""}
                  onChange={(value) => field.handleChange(value ?? "")}
                  onBlur={field.handleBlur}
                  icon={Globe2}
                  placeholder="Sélectionner une ville"
                  emptyLabel="Aucune ville trouvée."
                />
                <InputErrorContainer>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.map((error) => (
                      <InputErrorMessage
                        key={error?.message}
                        message={error?.message}
                      />
                    ))}
                </InputErrorContainer>
              </div>
            )}
          </form.Field>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Rôle */}
        <div>
          <Heading>Permissions & Sécurité</Heading>
          <form.Field name="role">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Rôle</Label>
                <Combobox
                  items={[
                    { id: 1, value: Role.USER, label: "Utilisateur" },
                    { id: 2, value: Role.WORKSPACE, label: "Entreprise" },
                    { id: 3, value: Role.ADMIN, label: "Admin" },
                  ]}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as Role)}
                  onBlur={field.handleBlur}
                  icon={ShieldCog}
                  placeholder="Sélectionner un rôle"
                  emptyLabel="Aucun rôle trouvé."
                />
                <InputErrorContainer>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.map((error) => (
                      <InputErrorMessage
                        key={error?.message}
                        message={error?.message}
                      />
                    ))}
                </InputErrorContainer>
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.values.role}>
            {(role) => {
              switch (role) {
                case "WORKSPACE":
                  form.setFieldValue("plan", Plan.STARTER);
                  break;
                default:
                  form.setFieldValue("plan", Plan.FREE);
                  break;
              }
              return (
                <form.Field name="plan">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Plan</Label>
                      <Combobox
                        items={
                          role === Role.USER || role === Role.ADMIN
                            ? [{ id: 1, value: Plan.FREE, label: "Gratuit" }]
                            : [
                                {
                                  id: 2,
                                  value: Plan.STARTER,
                                  label: "Starter",
                                },
                                { id: 3, value: Plan.PRO, label: "Pro" },
                                {
                                  id: 4,
                                  value: Plan.BUSINESS,
                                  label: "Business",
                                },
                              ]
                        }
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value as Plan)}
                        onBlur={field.handleBlur}
                        icon={BadgeDollarSign}
                        placeholder="Sélectionner un plan"
                        emptyLabel="Aucun plan trouvé."
                      />
                      <InputErrorContainer>
                        {field.state.meta.isTouched &&
                          field.state.meta.errors.map((error) => (
                            <InputErrorMessage
                              key={error?.message}
                              message={error?.message}
                            />
                          ))}
                      </InputErrorContainer>
                    </div>
                  )}
                </form.Field>
              );
            }}
          </form.Subscribe>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Mot de passe</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={field.state.value}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  position="left"
                  autoComplete="new-password"
                  className="min-w-auto w-full rounded-lg"
                />
                <InputErrorContainer>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.map((error) => (
                      <InputErrorMessage
                        key={error?.message}
                        message={error?.message}
                      />
                    ))}
                </InputErrorContainer>
              </div>
            )}
          </form.Field>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Vérifications */}
        <div>
          <Heading>Vérifications</Heading>
          <form.Field name="emailVerified">
            {(field) => (
              <div className="space-y-1.5">
                <div
                  className={cn(
                    "w-full border-input dark:border-neutral-800 border px-2.5 py-3 rounded-md flex gap-x-2 justify-between items-center transition-all",
                    field.state.value &&
                      "border-amber-400 ring-[3px] ring-amber-400/20",
                  )}
                >
                  <div>
                    <Label
                      htmlFor={field.name}
                      className="text-neutral-600 dark:text-neutral-300"
                    >
                      Email vérifié
                    </Label>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {field.state.value
                        ? "Compte actif immédiatement"
                        : "Un OTP sera envoyé pour confirmation"}
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              </div>
            )}
          </form.Field>
        </div>

        {/* Erreur globale (API) */}
        {globalError && (
          <ErrorMessage
            message={globalError}
            onDismiss={() => setGlobalError(null)}
          />
        )}

        {/* Footer */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="rounded-md"
          >
            Annuler
          </Button>
          <Button
            variant="amber"
            type="submit"
            disabled={
              mode === "create" ? createUser.isPending : updateUser.isPending
            }
            className="rounded-md"
          >
            {mode === "create" ? (
              createUser.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )
            ) : updateUser.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {mode === "create"
              ? createUser.isPending
                ? "Création…"
                : "Créer"
              : updateUser.isPending
                ? "Mise à jour…"
                : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </div>
  );
}
