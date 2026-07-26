import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import {
  Hash,
  Layers,
  Loader2,
  Palette,
  Save,
  SmilePlus,
  X,
} from "lucide-react";
import { toSlug } from "#/lib/utils";

import type { Category, CategorySchemaType } from "@lokale/types/category";

import SelectField from "#/components/select/select-field";
import PanelIntro from "#/components/sheet/panel-intro";
import Heading from "#/components/typography/heading";
import Required from "#/components/input/required";
import Input from "#/components/input/input";
import { Separator } from "#/components/ui/separator";

const COULEURS = [
  { label: "Ambre", value: "#f59e0b" },
  { label: "Bleu", value: "#3b82f6" },
  { label: "Vert", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Orange", value: "#f97316" },
  { label: "Slate", value: "#64748b" },
];

interface CategoryFormProps {
  defaultValues?: Category;
  onSubmit: (values: CategorySchemaType) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      color: defaultValues?.color ?? "",
      icon: defaultValues?.icon ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        slug: value.slug.trim() || toSlug(value.name),
        description: value.description.trim(),
        color: value.color || undefined,
        icon: value.icon.trim() || undefined,
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Layers}
        title={defaultValues ? "Modifier la catégorie" : "Nouvelle catégorie"}
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
          {defaultValues ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </Heading>

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
                icon={Layers}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Électronique"
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
                placeholder="electronique (auto-généré si vide)"
                position="left"
                className="min-w-auto w-full rounded-lg font-mono"
                required={false}
              />
            </div>
          )}
        </form.Field>

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
                placeholder="Description de la catégorie…"
                className="text-[13px] resize-none rounded-lg"
                rows={2}
                disabled={isSubmitting}
                required={false}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="icon">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Icône (emoji)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={SmilePlus}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="💻"
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                  required={false}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="color">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Couleur
                </Label>
                <SelectField
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  icon={Palette}
                  iconPosition="left"
                  onValueChange={(v: string | null) =>
                    field.handleChange(v as string)
                  }
                  options={COULEURS.map((c) => ({
                    value: c.value,
                    label: c.label,
                  }))}
                  placeholder="Choisir une couleur"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </form.Field>
        </div>
        <Separator className="dark:bg-neutral-800 shrink-0" />

        <div className="grid grid-cols-1 gap-2 mt-auto pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md"
          >
            <X className="size-3.5" /> Annuler
          </Button>
          <Button
            type="submit"
            variant="amber"
            size="sm"
            className="h-8 rounded-md gap-1.5"
            disabled={isSubmitting}
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
