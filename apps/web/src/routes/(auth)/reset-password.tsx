import { AuthCard } from "#/components/card/auth-card";
import { AuthLayout } from "#/components/layout/auth-layout";
import { InputErrorMessage } from "#/components/message/input-error-message";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { secureAuth } from "#/lib/secure";
import { useForm } from "@tanstack/react-form";
// import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
// import { toast } from "sonner";

import Input from "#/components/input/input";
import Loader from "#/components/ui/loader";
import z from "zod";

export const Route = createFileRoute("/(auth)/reset-password")({
  beforeLoad: ({ context }) => {
    secureAuth(context.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  // En vrai : token récupéré depuis les search params
  // const { token } = Route.useSearch()

  const form = useForm({
    defaultValues: {
      password: "",
      confirm: "",
    },
    onSubmit: async ({ value }) => {
      // await authClient.resetPassword(
      //   {
      //     newPassword: value.password,
      //     // token,
      //   },
      //   {
      //     onSuccess: () => {
      //       setDone(true);
      //       toast.success("Mot de passe réinitialisé avec succès.");
      //     },
      //     onError: (error) => {
      //       toast.error(error.error.message || error.error.statusText);
      //     },
      //   },
      // );
    },
    validators: {
      onSubmit: z
        .object({
          password: z
            .string()
            .min(8, "Minimum 8 caractères")
            .regex(/[A-Z]/, "Au moins une majuscule")
            .regex(/[0-9]/, "Au moins un chiffre"),
          confirm: z.string(),
        })
        .refine((d) => d.password === d.confirm, {
          message: "Les mots de passe ne correspondent pas",
          path: ["confirm"],
        }),
    },
  });

  // const { isPending } = useMutation({
  //   mutationFn: async () => {},
  // });

  if (done) {
    return (
      <AuthLayout
        title="Découvrez chaque lieu qui compte autour de vous."
        subtitle="Lokale recense restaurants, hôtels, pharmacies et commerces du Congo pour que vous trouviez toujours ce dont vous avez besoin."
      >
        <AuthCard title="" description="">
          <div className="flex flex-col items-center text-center py-4 space-y-6">
            <div className="relative">
              <div className="size-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck
                  className="size-10 text-emerald-500"
                  strokeWidth={1.5}
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Mot de passe mis à jour !
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Votre mot de passe a bien été réinitialisé. Vous pouvez
                maintenant vous connecter avec vos nouveaux identifiants.
              </p>
            </div>

            <Button
              variant="amber"
              className="w-full rounded-md"
              onClick={() => navigate({ to: "/sign-in" })}
            >
              Se connecter
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Découvrez chaque lieu qui compte autour de vous."
      subtitle="Lokale recense restaurants, hôtels, pharmacies et commerces du Congo pour que vous trouviez toujours ce dont vous avez besoin."
    >
      <AuthCard
        title="Nouveau mot de passe"
        description="Choisissez un mot de passe fort pour sécuriser votre compte."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          {/* Mot de passe */}
          <div>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nouveau mot de passe</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="Minimum 8 caractères"
                    icon={Lock}
                    value={field.state.value}
                    hasError={!field.state.meta.isValid}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="new-password"
                    className="min-w-auto w-full rounded-lg"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Confirmer */}
          <div>
            <form.Field name="confirm">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirmer le mot de passe</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    value={field.state.value}
                    hasError={!field.state.meta.isValid}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    position="left"
                    autoComplete="new-password"
                    className="min-w-auto w-full rounded-lg"
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
          </div>

          {/* Règles */}
          <div className="p-3.5 rounded-md bg-slate-50 dark:bg-neutral-800/60 border border-input dark:border-neutral-700 space-y-2">
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Le mot de passe doit contenir
            </p>
            <form.Field name="password">
              {(field) => (
                <ul className="space-y-1.5">
                  {[
                    {
                      rule: field.state.value.length >= 8,
                      label: "Au moins 8 caractères",
                    },
                    {
                      rule: /[A-Z]/.test(field.state.value),
                      label: "Au moins une majuscule",
                    },
                    {
                      rule: /[0-9]/.test(field.state.value),
                      label: "Au moins un chiffre",
                    },
                    {
                      rule: /[^A-Za-z0-9]/.test(field.state.value),
                      label: "Un caractère spécial (recommandé)",
                    },
                  ].map(({ rule, label }) => (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={`size-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          rule
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-neutral-700"
                        }`}
                      >
                        {rule && (
                          <svg
                            className="size-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        className={`text-[11px] font-medium transition-colors ${
                          rule
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </form.Field>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  variant="amber"
                  className="w-full rounded-md"
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

        <Link
          to="/sign-in"
          className="flex items-center justify-center gap-1.5 mt-6 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
