import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { CONTINENTS } from "@lokale/config/localisation";
import { useForm } from "@tanstack/react-form";
import {
  Banknote,
  Flag,
  Globe2,
  Hash,
  MapPin,
  Phone,
  Save,
  X,
} from "lucide-react";

import type { Country, Currency } from "@lokale/types/localisation";

import SelectField from "#/components/select/select-field";
import PanelIntro from "#/components/sheet/panel-intro";
import Heading from "#/components/typography/heading";
import Input from "#/components/input/input";
import Required from "#/components/input/required";
import AlertMessage from "#/components/alert/alert-message";
import Loader from "#/components/ui/loader";

export interface CountryFormValues {
  name: string;
  code: string;
  phoneCode: string;
  continent: string;
  currencyId: string;
}

interface CountryFormProps {
  defaultValues?: Country;
  currencies: Currency[];
  onSubmit: (values: CountryFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CountryForm({
  defaultValues,
  currencies,
  onSubmit,
  onCancel,
  isSubmitting,
}: CountryFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      code: defaultValues?.code ?? "",
      phoneCode: defaultValues?.phoneCode ?? "",
      continent: defaultValues?.continent ?? "",
      currencyId: defaultValues?.currencyId ?? currencies[0]?.id ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        code: value.code.trim().toUpperCase(),
        phoneCode: value.phoneCode.trim(),
        continent: value.continent.trim(),
        currencyId: value.currencyId,
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Flag}
        title={defaultValues ? "Modifier le pays" : "Nouveau pays"}
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
        <Heading>{defaultValues ? "Modifier le pays" : "Nouveau pays"}</Heading>

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
                placeholder="ex: République du Congo"
                position="left"
                autoComplete="country"
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
          <form.Field
            name="code"
            validators={{
              onChange: ({ value }) =>
                value.trim().length !== 2 ? "2 lettres exactement" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label htmlFor={field.name}>
                  Code ISO <Required />
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value.toUpperCase())
                  }
                  icon={Hash}
                  onBlur={field.handleBlur}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  placeholder="CG"
                  position="left"
                  autoComplete="country-code"
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

          <form.Field name="phoneCode">
            {(field) => (
              <div>
                <label htmlFor={field.name}>
                  Indicatif <Required />
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="+242"
                  icon={Phone}
                  value={field.state.value}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  position="left"
                  autoComplete="country-phone-code"
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
        </div>

        <form.Field name="continent">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>
                Continent <Required />
              </Label>
              <SelectField
                id={field.name}
                name={field.name}
                value={field.state.value}
                icon={Globe2}
                iconPosition="left"
                onValueChange={(v: string | null) =>
                  field.handleChange(v as string)
                }
                options={CONTINENTS.map((c) => ({
                  value: c,
                  label: c,
                }))}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                placeholder="Choisir un continent"
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

        <form.Field name="currencyId">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>
                Devise <Required />
              </Label>
              <SelectField
                id={field.name}
                name={field.name}
                value={field.state.value}
                icon={Banknote}
                iconPosition="left"
                onValueChange={(v: string | null) =>
                  field.handleChange(v as string)
                }
                options={currencies.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                placeholder="Choisir une devise"
              />
              <InputErrorContainer>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.map((error, i) => (
                    <InputErrorMessage key={i} message={error} />
                  ))}
              </InputErrorContainer>

              {currencies.length === 0 && (
                <AlertMessage
                  type="warning"
                  title="Aucune devise disponible"
                  description="Aucune devise n'a été trouvée. Veuillez en créer une avant de continuer."
                  className="mt-2"
                />
              )}
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
            disabled={currencies.length === 0 || isSubmitting}
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
