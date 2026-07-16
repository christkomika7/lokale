import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, ShieldX, ArrowLeft, RefreshCw, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { AuthCard } from "#/components/card/auth-card";
import { AuthLayout } from "#/components/layout/auth-layout";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { InputErrorMessage } from "#/components/message/input-error-message";
import { useCountdown } from "#/hook/use-countdown";
import { useApiMutation } from "#/hook/use-api-mutation";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";
import { VERIFY_EMAIL_RESEND_COOLDOWN } from "@lokale/config/auth/otp";
import { emailSchema } from "@lokale/lib/validator/user";

import z from "zod";
import Input from "#/components/input/input";
import Loader from "#/components/ui/loader";

type ResetState =
  | "loading"
  | "valid"
  | "expired"
  | "already-used"
  | "invalid"
  | "success";

export const Route = createFileRoute("/(auth)/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
    error: (search.error as string) ?? "",
  }),
  component: RouteComponent,
});

/**
 * Formulaire de renvoi de lien réutilisé par les états "invalid" et "expired".
 * Volontairement absent de l'état "already-used" : un lien déjà consommé
 * ne doit pas devenir un point d'entrée pour renvoyer des emails à volonté.
 */
function ResendResetForm({
  manualEmail,
  setManualEmail,
  emailError,
  setEmailError,
  isResending,
  canResend,
  formatted,
  resent,
  onSubmit,
}: {
  manualEmail: string;
  setManualEmail: (v: string) => void;
  emailError: string | null;
  setEmailError: (v: string | null) => void;
  isResending: boolean;
  canResend: boolean;
  formatted: string;
  resent: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <>
      {resent && (
        <div className="w-full flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <RefreshCw className="size-3.5 text-emerald-500 shrink-0" />
          <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 text-left">
            Si un compte existe avec cette adresse, un email vient d'être
            envoyé.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="w-full space-y-2.5" noValidate>
        <div className="text-left space-y-1">
          <label
            htmlFor="resend-email"
            className="block text-[12px] font-medium text-neutral-600 dark:text-neutral-300"
          >
            Adresse email
          </label>
          <input
            id="resend-email"
            type="email"
            autoComplete="email"
            value={manualEmail}
            onChange={(ev) => {
              setManualEmail(ev.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder="vous@exemple.com"
            disabled={isResending}
            className="w-full h-10 px-3 rounded-md border border-input dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-amber-400/60 disabled:opacity-60"
          />
          {emailError && (
            <p className="text-[11px] text-red-500">{emailError}</p>
          )}
        </div>

        {canResend ? (
          <Button
            type="submit"
            variant="amber"
            className="w-full rounded-md"
            disabled={isResending}
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                Envoi en cours…
              </span>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Renvoyer le lien
              </>
            )}
          </Button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-input dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60">
            <RefreshCw className="size-3.5 text-neutral-400" />
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              Renvoyer dans{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums">
                {formatted}
              </span>
            </p>
          </div>
        )}

        <Link to="/sign-in">
          <Button
            variant="amber"
            className="w-full bg-amber-500! rounded-md flex"
          >
            <ArrowLeft className="size-3.5" />
            Retour à la connexion
          </Button>
        </Link>
      </form>
    </>
  );
}

function RouteComponent() {
  const { token, error: tokenError } = Route.useSearch();
  const navigate = useNavigate();

  const [state, setState] = useState<ResetState>(
    token && !tokenError ? "loading" : "invalid",
  );

  const [manualEmail, setManualEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const checkResetTokenStatus = useApiMutation<
    { status: "pending" | "expired" | "already-used" | "invalid" },
    { token: string }
  >(() => `/user/reset-password-token-status?token=${token}`, {
    method: "get",
  });

  const resendReset = useApiMutation<{ message: string }, { email: string }>(
    () => `/user/resend-reset-password`,
    { method: "post" },
  );

  const { formatted, canResend, restart } = useCountdown({
    key: `reset-password-resend:${manualEmail.trim().toLowerCase() || "anonymous"}`,
    initial: VERIFY_EMAIL_RESEND_COOLDOWN,
  });

  useEffect(() => {
    if (!token || tokenError) {
      setState("invalid");
      return;
    }

    checkResetTokenStatus.mutate(
      { token },
      {
        onSuccess: (data) => {
          switch (data.status) {
            case "pending":
              setState("valid");
              break;
            case "expired":
              setState("expired");
              break;
            case "already-used":
              setState("already-used");
              break;
            default:
              setState("invalid");
          }
        },
        onError: () => setState("invalid"),
      },
    );
  }, [token, tokenError]);

  const form = useForm({
    defaultValues: {
      password: "",
      confirm: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });

      if (error) {
        toast.error(
          getAuthErrorMessage(error) ??
            "Impossible de réinitialiser le mot de passe.",
        );
        setState("invalid");
        return;
      }

      setState("success");
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

  async function handleResend(e: FormEvent) {
    e.preventDefault();

    const parsed = emailSchema.safeParse({ email: manualEmail });
    if (!parsed.success) {
      setEmailError("Adresse email invalide.");
      return;
    }

    setEmailError(null);
    setIsResending(true);

    resendReset.mutate(
      { email: parsed.data.email },
      {
        onSuccess: () => {
          setResent(true);
          restart();
          toast.success(
            "Si un compte existe avec cette adresse, un nouveau lien vient d'être envoyé.",
          );
        },
        onError: () => {
          toast.error("Impossible de renvoyer le lien pour le moment.");
        },
        onSettled: () => setIsResending(false),
      },
    );
  }

  const cardProps =
    state === "valid"
      ? {
          title: "Nouveau mot de passe",
          description:
            "Choisissez un mot de passe fort pour sécuriser votre compte.",
        }
      : { title: "", description: "" };

  return (
    <AuthLayout
      title="Découvrez chaque lieu qui compte autour de vous."
      subtitle="Lokale recense restaurants, hôtels, pharmacies et commerces du Congo pour que vous trouviez toujours ce dont vous avez besoin."
    >
      <AuthCard title={cardProps.title} description={cardProps.description}>
        {state === "valid" && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
              noValidate
            >
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

              <form.Field name="confirm">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Confirmer le mot de passe
                    </Label>
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
          </>
        )}

        {state === "success" && (
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
        )}

        {state === "expired" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ShieldX className="size-10 text-amber-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Ce lien a expiré
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Le lien de réinitialisation a expiré pour votre sécurité.
                Saisissez votre adresse email pour en recevoir un nouveau.
              </p>
            </div>

            <ResendResetForm
              manualEmail={manualEmail}
              setManualEmail={setManualEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              isResending={isResending}
              canResend={canResend}
              formatted={formatted}
              resent={resent}
              onSubmit={handleResend}
            />
          </div>
        )}

        {state === "already-used" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <ShieldX className="size-10 text-red-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Ce lien a déjà été utilisé
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Ce lien de réinitialisation a déjà servi. Si vous n'êtes pas à
                l'origine de cette action, connectez-vous et changez votre mot
                de passe, ou contactez le support.
              </p>
            </div>

            <Link to="/sign-in" className="w-full">
              <Button variant="amber" className="w-full rounded-md flex">
                <ArrowLeft className="size-3.5" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
        )}

        {state === "invalid" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ShieldX className="size-10 text-amber-500" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Lien invalide
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Ce lien de réinitialisation est invalide. Saisissez votre
                adresse email pour en recevoir un nouveau.
              </p>
            </div>

            <ResendResetForm
              manualEmail={manualEmail}
              setManualEmail={setManualEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              isResending={isResending}
              canResend={canResend}
              formatted={formatted}
              resent={resent}
              onSubmit={handleResend}
            />
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
