import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { Hash, Layers, Loader2, Save, X } from "lucide-react";
import { toSlug } from "#/lib/utils";

import type {
  SubCategory,
  SubCategorySchemaType,
} from "@lokale/types/category";

import PanelIntro from "#/components/sheet/panel-intro";
import Heading from "#/components/typography/heading";
import Required from "#/components/input/required";
import Input from "#/components/input/input";

interface SubCategoryFormProps {
  defaultValues?: SubCategory;
  onSubmit: (values: SubCategorySchemaType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SubCategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: SubCategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        slug: value.slug.trim() || toSlug(value.name),
        description: value.description.trim(),
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Layers}
        title={
          defaultValues
            ? "Modifier la sous-catégorie"
            : "Nouvelle sous-catégorie"
        }
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
          {defaultValues
            ? "Modifier la sous-catégorie"
            : "Nouvelle sous-catégorie"}
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
                placeholder="ex: Smartphones"
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
                placeholder="smartphones (auto-généré si vide)"
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
                placeholder="Description optionnelle…"
                className="text-[13px] resize-none rounded-lg"
                rows={2}
                disabled={isSubmitting}
                required={false}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
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
            {defaultValues ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
