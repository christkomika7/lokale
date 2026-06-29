import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { AuthLayout } from "#/components/layout/auth-layout";
import { Label } from "#/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { Checkbox } from "#/components/ui/checkbox";
import { Button } from "#/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "#/components/card/auth-card";
import { SocialGroupButton } from "#/components/button/social-group-button";
import {
  InputErrorContainer,
  InputErrorMessage,
} from "#/components/message/input-error-message";
import { authClient } from "#/lib/auth-client";
import { signInSchema } from "@lokale/lib/validator/auth";
import { secureAuth } from "#/lib/secure";
import { Role } from "@lokale/types/user";

import Input from "#/components/input/input";
import ErrorMessage from "#/components/message/error-message";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";

export const Route = createFileRoute("/(auth)/sign-in")({
  beforeLoad: ({ context }) => {
    secureAuth(context.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);

      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: remember,
        },
        {
          onSuccess: ({ data }) => {
            const role = data.user.role as Role;
            toast.success("Connexion réussie");
            switch (role) {
              case Role.ADMIN: {
                navigate({ to: "/admin" });
                break;
              }
              case Role.WORKSPACE: {
                navigate({ to: "/workspace" });
                break;
              }
              case Role.USER: {
                navigate({ to: "/user" });
                break;
              }
            }
          },
          onError: (ctx) => {
            const message = getAuthErrorMessage(ctx.error);
            setGlobalError(message);
            toast.error(message);
          },
        },
      );
    },
  });

  return (
    <AuthLayout
      title="Découvrez chaque lieu qui compte autour de vous."
      subtitle="Lokale. recense restaurants, hôtels, pharmacies et commerces du Congo pour que vous trouviez toujours ce dont vous avez besoin, là où vous êtes."
    >
      <AuthCard
        title="Bon retour"
        description="Connectez-vous pour accéder à votre espace."
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
                  autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
                className="size-4"
              />
              <Label
                htmlFor="remember"
                className="text-[12px] text-neutral-500 dark:text-neutral-400 cursor-pointer"
              >
                Se souvenir de moi
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-[12px] font-medium text-amber-500 hover:text-amber-600 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

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
                    "Se connecter"
                  )}
                </Button>
              )}
            </form.Subscribe>
            {globalError && (
              <ErrorMessage
                message={globalError}
                className="mt-2"
                onDismiss={() => setGlobalError(null)}
              />
            )}
          </div>
        </form>

        <p className="text-center text-[12px] text-neutral-500 dark:text-neutral-200 mt-6">
          Pas encore de compte ?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-amber-500 hover:text-amber-600 transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
