import Input from "#/components/input/input";
import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import type { Currency } from "@lokale/types/localisation";
import { Banknote, Coins, Hash, Save, Wallet, X } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import Heading from "#/components/typography/heading";
import PanelIntro from "#/components/sheet/panel-intro";
import { Label } from "#/components/ui/label";
import Required from "#/components/input/required";
import Loader from "#/components/ui/loader";

interface CurrencyFormProps {
  defaultValues?: Currency;
  onSubmit: (values: Omit<Currency, "id">) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CurrencyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
}: CurrencyFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      code: defaultValues?.code ?? "",
      symbol: defaultValues?.symbol ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        code: value.code.trim().toUpperCase(),
        symbol: value.symbol.trim(),
      });
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Wallet}
        title={defaultValues ? "Modifier la devise" : "Nouvelle devise"}
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
          {defaultValues ? "Modifier la devise" : "Nouvelle devise"}
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
                icon={Banknote}
                hasError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="ex: Franc CFA"
                position="left"
                autoComplete="currency-name"
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
                value.trim().length !== 3 ? "3 lettres exactement" : undefined,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>
                  Code ISO <Required />
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Hash}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="ex: XAF"
                  position="left"
                  autoComplete="currency-code"
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

          <form.Field name="symbol">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>
                  Symbole <Required />
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  icon={Coins}
                  hasError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="ex: FCFA"
                  position="left"
                  autoComplete="currency-symbol"
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
            disabled={isSubmitting}
            className="h-8 rounded-md gap-1.5"
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
