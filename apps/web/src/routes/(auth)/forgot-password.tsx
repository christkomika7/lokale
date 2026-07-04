import { AuthCard } from "#/components/card/auth-card";
import { AuthLayout } from "#/components/layout/auth-layout";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { secureAuth } from "#/lib/secure";
import { authClient } from "#/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

import Input from "#/components/input/input";
import Loader from "#/components/ui/loader";
import z from "zod";
import { InputErrorMessage } from "#/components/message/input-error-message";

export const Route = createFileRoute("/(auth)/forgot-password")({
  beforeLoad: ({ context }) => {
    secureAuth(context.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        form.setFieldMeta("email", (prev) => ({
          ...prev,
          errors: [
            { message: error.message ?? "Une erreur est survenue. Réessayez." },
          ],
          errorMap: {
            onSubmit: error.message ?? "Une erreur est survenue. Réessayez.",
          },
        }));
        return;
      }

      setSentEmail(value.email);
      setSent(true);
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Adresse email invalide"),
      }),
    },
  });

  return (
    <AuthLayout
      title="Découvrez chaque lieu qui compte autour de vous."
      subtitle="Lokale. recense restaurants, hôtels, pharmacies et commerces du Congo pour que vous trouviez toujours ce dont vous avez besoin."
    >
      <AuthCard
        title={sent ? "Email envoyé" : "Mot de passe oublié ?"}
        description={
          sent
            ? `Un lien de réinitialisation a été envoyé à ${sentEmail}. Vérifiez votre boîte mail et vos spams.`
            : "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
        }
      >
        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
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
                    hasError={!field.state.meta.isValid}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="email"
                    className="min-w-auto w-full rounded-md"
                  />
                  {field.state.meta.errors.map((error) => (
                    <InputErrorMessage
                      key={error?.message}
                      message={error?.message}
                    />
                  ))}
                </div>
              )}
            </form.Field>

            <div className="pt-1">
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    variant="amber"
                    className="w-full bg-amber-500! rounded-md flex"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader className="size-3.5!" />
                    ) : (
                      "Réinitialiser le mot de passe"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        ) : (
          <div className="flex justify-center py-4">
            <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <svg
                className="size-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
          </div>
        )}

        <Link
          to="/sign-in"
          className="flex items-center justify-center gap-1.5 mt-6 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Retour à la connexion
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
