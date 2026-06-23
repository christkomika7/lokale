import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader, Lock, Mail, User } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { AuthLayout } from "#/components/layout/auth-layout";
import { AuthCard } from "#/components/card/auth-card";
import { SocialGroupButton } from "#/components/button/social-group-button";
import {
  InputErrorMessage,
  InputErrorContainer,
} from "#/components/message/input-error-message";
import { authClient } from "#/lib/auth-client";
import { signUpSchema } from "@lokale/lib/validator/auth";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";
import { usePendingVerificationStore } from "#/store/pending-verification.store";

import Input from "#/components/input/input";
import ErrorMessage from "#/components/message/error-message";
import { useCountdownStore } from "#/store/countdown.store";
import { OTP_RESEND_COOLDOWN } from "@lokale/config/auth/otp";
import { secureAuth } from "#/lib/secure";

export const Route = createFileRoute("/(auth)/sign-up")({
  beforeLoad: ({ context }) => {
    secureAuth(context.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      lastname: "",
      firstname: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);

      await authClient.signUp.email(
        {
          name: `${value.firstname} ${value.lastname}`,
          firstname: value.firstname,
          lastname: value.lastname,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
              email: value.email,
              type: "email-verification",
            });

            if (error) {
              toast.error(
                "Compte créé mais l'envoi du code a échoué. Réessayez.",
              );
              usePendingVerificationStore.getState().setEmail(value.email);
              navigate({ to: "/verify-otp" });
              return;
            }

            useCountdownStore
              .getState()
              .setTimer(
                `otp-resend:${value.email}`,
                OTP_RESEND_COOLDOWN * 1000,
              );
            usePendingVerificationStore.getState().setEmail(value.email);
            toast.success("Compte créé ! Vérifiez votre email.");
            navigate({ to: "/verify-otp" });
          },
          onError: (ctx) => {
            const code = ctx.error.code;
            const message = getAuthErrorMessage(code) ?? ctx.error.message;
            setGlobalError(message);
            toast.error(message);
          },
        },
      );
    },
  });

  return (
    <AuthLayout
      title="Trouvez tout ce dont vous avez besoin, près de chez vous."
      subtitle="Rejoignez Lokale. et accédez à des milliers de lieux référencés au Congo — restaurants, pharmacies, hôtels et bien plus encore."
    >
      <AuthCard
        title="Créer un compte"
        description="Rejoignez des milliers d'utilisateurs au Congo."
      >
        <SocialGroupButton withDivider />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-1"
          noValidate
        >
          {globalError && (
            <ErrorMessage
              message={globalError}
              onDismiss={() => setGlobalError(null)}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="lastname">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nom</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Moukoko"
                    icon={User}
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
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Prénom</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Jean-Baptiste"
                    icon={User}
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
          </div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
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
          <p className="text-xs text-neutral-400 dark:text-neutral-200 leading-relaxed">
            En créant un compte, vous acceptez nos{" "}
            <a
              href="/terms"
              className="text-amber-500 hover:text-amber-600 transition-colors font-medium"
            >
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a
              href="/privacy"
              className="text-amber-500 hover:text-amber-600 transition-colors font-medium"
            >
              Politique de confidentialité
            </a>
            .
          </p>

          <div className="pt-1">
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="amber"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500! rounded-md flex"
                >
                  {isSubmitting ? (
                    <Loader className="size-3.5! animate-spin" />
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-200 mt-4">
          Déjà un compte ?{" "}
          <Link
            to="/sign-in"
            className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
