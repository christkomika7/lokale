import { useForm } from "@tanstack/react-form";
import { Hash, Layers, Loader2, MapPin, Save, Users, X } from "lucide-react";

import Input from "#/components/input/input";
import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import SelectField from "#/components/select/select-field";
import PanelIntro from "#/components/sheet/panel-intro";
import Heading from "#/components/typography/heading";
import Required from "#/components/input/required";
import { CITY_TYPE_LABELS, CITY_TYPES } from "@lokale/config/localisation";
import { api } from "../lib/api";

import type { City, CitySchemaType } from "@lokale/types/localisation";
import type { CityType } from "@lokale/lib/validator/localisation";

interface CityFormProps {
  defaultValues?: City;
  onSubmit: (values: CitySchemaType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CityForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CityFormProps) {
  // Liste des pays pour le select — perPage volontairement large pour couvrir
  // le cas d'usage "choisir dans une liste complète", pas une pagination réelle ici.
  const { data: countriesData, isLoading: countriesLoading } = api.getCountries(
    { perPage: 200, sortBy: "name", sortOrder: "asc" },
  );
  const countries = countriesData?.items ?? [];

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      region: defaultValues?.region ?? "",
      type: defaultValues?.type ?? ("CITY" as CityType),
      population: defaultValues?.population ?? ("" as unknown as number),
      countryId: defaultValues?.countryId ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        region: value.region.trim() || "",
        type: value.type,
        population: value.population ? Number(value.population) : undefined,
        countryId: value.countryId,
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={MapPin}
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
                icon={MapPin}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Brazzaville"
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

        <form.Field
          name="countryId"
          validators={{
            onChange: ({ value }) => (!value ? "Pays obligatoire" : undefined),
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name}>
                Pays <Required />
              </Label>
              <SelectField
                id={field.name}
                name={field.name}
                value={field.state.value}
                icon={MapPin}
                iconPosition="left"
                onValueChange={(v: string | null) =>
                  field.handleChange(v as string)
                }
                options={countries.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                emptyMessage={
                  countriesLoading ? "Chargement…" : "Aucun pays disponible"
                }
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                placeholder="Choisir un pays"
                disabled={isSubmitting || countriesLoading}
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
                <Label htmlFor={field.name}>Région</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Hash}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ex: Pool"
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                  required={false}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="population">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Population</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  icon={Users}
                  value={field.state.value as unknown as string}
                  onChange={(e) =>
                    field.handleChange(e.target.value as unknown as number)
                  }
                  placeholder="ex: 2000000"
                  position="left"
                  className="min-w-auto w-full rounded-lg"
                  required={false}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="type">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Type</Label>
              <SelectField
                id={field.name}
                name={field.name}
                value={field.state.value}
                icon={Layers}
                iconPosition="left"
                onValueChange={(v: string | null) =>
                  field.handleChange(v as CityType)
                }
                options={CITY_TYPES.map((t) => ({
                  value: t,
                  label: CITY_TYPE_LABELS[t],
                }))}
                disabled={isSubmitting}
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
