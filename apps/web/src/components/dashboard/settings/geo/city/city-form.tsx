import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { CITY_TYPE_LABELS, CITY_TYPES } from "@lokale/config/localisation";
import { useForm } from "@tanstack/react-form";
import { Building2, Goal, Map, Save, Tag, Users, X } from "lucide-react";
import { Label } from "#/components/ui/label";

import type { City } from "@lokale/types/localisation";
import type { CityType } from "@lokale/lib/validator/localisation";

import Input from "#/components/input/input";
import Loader from "#/components/ui/loader";
import Heading from "#/components/typography/heading";
import PanelIntro from "#/components/sheet/panel-intro";
import Required from "#/components/input/required";
import SelectField from "#/components/select/select-field";

interface CityFormProps {
  defaultValues?: City;
  onSubmit: (values: Omit<City, "id" | "countryId">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CityForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CityFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      region: defaultValues?.region ?? "",
      type: defaultValues?.type ?? ("CITY" as CityType),
      population: defaultValues?.population ?? ("" as unknown as number),
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        region: value.region.trim(),
        type: value.type,
        population: value.population ? Number(value.population) : undefined,
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Goal}
        title={defaultValues ? "Modifier la ville" : "Nouvelle ville"}
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
          {defaultValues ? "Modifier la ville" : "Nouvelle ville"}
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
                icon={Building2}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Brazzaville"
                position="left"
                autoComplete="city"
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

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="region">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Région
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Map}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="ex: Pool"
                  position="left"
                  required={false}
                  autoComplete="region"
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="population">
            {(field) => (
              <div>
                <Label className="mb-2" htmlFor={field.name}>
                  Population
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Users}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  value={field.state.value?.toString()}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  placeholder="ex: 2 000 000"
                  position="left"
                  autoComplete="population"
                  required={false}
                  className="min-w-auto w-full rounded-lg"
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="type">
          {(field) => (
            <div>
              <Label className="mb-2" htmlFor={field.name}>
                Type
              </Label>
              <SelectField
                id={field.name}
                name={field.name}
                value={field.state.value}
                icon={Tag}
                iconPosition="left"
                onValueChange={(v: string | null) =>
                  field.handleChange(v as CityType)
                }
                options={CITY_TYPES.map((t) => ({
                  value: t,
                  label: CITY_TYPE_LABELS[t],
                }))}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                placeholder="Choisir un type"
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
              <Loader className="size-3.5 animate-spin" />
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
