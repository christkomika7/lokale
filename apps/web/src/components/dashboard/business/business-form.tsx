import { useForm } from "@tanstack/react-form";
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  X,
} from "lucide-react";

import Input from "#/components/input/input";
import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import PanelIntro from "#/components/sheet/panel-intro";
import Heading from "#/components/typography/heading";
import Required from "#/components/input/required";
import { toSlug } from "#/lib/utils";

import type { Business, BusinessSchemaType } from "@lokale/types/business";
import { authClient } from "#/lib/auth-client";

interface BusinessFormProps {
  defaultValues?: Business;
  onSubmit: (values: BusinessSchemaType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BusinessForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BusinessFormProps) {
  const session = authClient.useSession();
  const form = useForm({
    defaultValues: {
      ownerId: defaultValues?.ownerId ?? session.data?.user.id ?? "",
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      category: defaultValues?.category ?? "",
      sector: defaultValues?.sector ?? "",
      address: defaultValues?.address ?? "",
      city: defaultValues?.city ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        ownerId: value.ownerId,
        name: value.name.trim(),
        slug: value.slug.trim() || toSlug(value.name),
        description: value.description.trim() || undefined,
        category: value.category.trim() || undefined,
        sector: value.sector.trim() || undefined,
        address: value.address.trim() || undefined,
        city: value.city.trim() || undefined,
        phone: value.phone.trim() || undefined,
        email: value.email.trim() || undefined,
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Building2}
        title={defaultValues ? "Modifier l'entreprise" : "Nouvelle entreprise"}
        subtitle={
          defaultValues
            ? "Modifier les informations"
            : "Remplissez les informations"
        }
        onClose={onCancel}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="p-4 space-y-3"
      >
        <Heading>
          {defaultValues ? "Modifier l'entreprise" : "Nouvelle entreprise"}
        </Heading>

        {!defaultValues && (
          <form.Field
            name="ownerId"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "Propriétaire obligatoire (userId)" : undefined,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>
                  ID du propriétaire <Required />
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="userId"
                  className="min-w-auto w-full rounded-lg font-mono"
                />
                <InputErrorContainer>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.map((error, i) => (
                      <InputErrorMessage key={i} message={error} />
                    ))}
                </InputErrorContainer>
              </div>
            )}
          </form.Field>
        )}

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "Nom obligatoire" : undefined,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name}>
                Nom <Required />
              </Label>
              <Input
                id={field.name}
                name={field.name}
                icon={Building2}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Restaurant Le Saveur"
                position="left"
                className="min-w-auto w-full rounded-lg"
              />
              <InputErrorContainer>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.map((error, i) => (
                    <InputErrorMessage key={i} message={error} />
                  ))}
              </InputErrorContainer>
            </div>
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <div>
              <Label className="mb-2" htmlFor={field.name}>
                Slug
              </Label>
              <Input
                id={field.name}
                name={field.name}
                icon={Hash}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="restaurant-le-saveur (auto-généré si vide)"
                position="left"
                className="min-w-auto w-full rounded-lg font-mono"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="category">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Catégorie
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ex: Restauration"
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="city">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Ville
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={MapPin}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ex: Pointe-Noire"
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="phone">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Téléphone
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Phone}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="+242..."
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Mail}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="contact@entreprise.cg"
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <div>
              <Label className="mb-2" htmlFor={field.name}>
                Description
              </Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Décrivez l'activité de l'entreprise…"
                className="text-[13px] resize-none rounded-lg"
                rows={2}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="rounded-md"
          >
            <X className="size-3.5" /> Annuler
          </Button>
          <Button
            type="submit"
            variant="amber"
            size="sm"
            className="h-8 rounded-md gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}{" "}
            {defaultValues ? "Modifier" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
