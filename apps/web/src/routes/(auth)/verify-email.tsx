import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { AuthCard } from "#/components/card/auth-card";
import { AuthLayout } from "#/components/layout/auth-layout";
import { Button } from "#/components/ui/button";
import { useCountdown } from "#/hook/use-countdown";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";
import { VERIFY_EMAIL_RESEND_COOLDOWN } from "@lokale/config/auth/otp";
import { useApiMutation } from "#/hook/use-api-mutation";
import { emailSchema } from "@lokale/lib/validator/user";

type VerifyState =
  | "loading"
  | "success"
  | "error"
  | "expired"
  | "already-verified";

interface VerifyResult {
  state: VerifyState;
  errorMessage?: string;
}

type TokenStatus = "pending" | "expired" | "already-verified" | "invalid";

export const Route = createFileRoute("/(auth)/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();

  const [result, setResult] = useState<VerifyResult>({ state: "loading" });
  const [manualEmail, setManualEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const checkTokenStatus = useApiMutation<
    { status: TokenStatus },
    { token: string }
  >(() => `/user/verification-token-status?token=${token}`, {
    method: "get",
  });

  const resendVerification = useApiMutation<
    { message: string },
    { email: string }
  >(() => `/user/resend-verification-email`, { method: "post" });

  const { formatted, canResend, restart } = useCountdown({
    key: `verify-email-resend:${manualEmail.trim().toLowerCase() || "anonymous"}`,
    initial: VERIFY_EMAIL_RESEND_COOLDOWN,
  });

  useEffect(() => {
    if (!token) {
      setResult({
        state: "error",
        errorMessage: "Lien de vérification invalide ou manquant.",
      });
      return;
    }

    let cancelled = false;

    async function verify() {
      const { error } = await authClient.verifyEmail({ query: { token } });

      if (cancelled) return;

      if (!error) {
        setResult({ state: "success" });
        return;
      }

      checkTokenStatus.mutate(
        { token },
        {
          onSuccess: (data) => {
            if (cancelled) return;

            switch (data.status) {
              case "expired":
              case "pending":
                setResult({ state: "expired" });
                break;
              case "already-verified":
                setResult({ state: "already-verified" });
                break;
              default:
                setResult({
                  state: "error",
                  errorMessage:
                    getAuthErrorMessage(error) ??
                    "Ce lien est invalide ou a déjà été utilisé.",
                });
            }
          },
          onError: () => {
            if (cancelled) return;
            setResult({
              state: "error",
              errorMessage:
                getAuthErrorMessage(error) ?? "La vérification a échoué.",
            });
          },
        },
      );
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend(e: FormEvent) {
    e.preventDefault();

    const email = emailSchema.safeParse({ email: manualEmail });
    if (!email.success) {
      setEmailError("Adresse email invalide.");
      return;
    }

    setEmailError(null);
    setIsResending(true);

    resendVerification.mutate(
      { email: email.data.email },
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

  return (
    <AuthLayout
      title="Trouvez facilement les lieux où il y a de l'ambiance."
      subtitle="Bars branchés, restaurants bondés, événements locaux."
    >
      <AuthCard title="" description="">
        {result.state === "loading" && (
          <div className="flex flex-col items-center text-center py-8 space-y-5">
            <div className="size-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="size-7 text-amber-500 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-[18px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Vérification en cours…
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Veuillez patienter pendant que nous confirmons votre adresse
                email.
              </p>
            </div>
          </div>
        )}

        {result.state === "success" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
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
                Email confirmé ! 🎉
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Votre adresse email a été vérifiée avec succès. Vous pouvez
                maintenant accéder à votre compte.
              </p>
            </div>
            <Link to="/sign-in">
              <Button
                variant="amber"
                className="w-full bg-amber-500! rounded-md flex"
              >
                <ArrowRight className="size-4" />
                Se connecter
              </Button>
            </Link>
          </div>
        )}

        {result.state === "already-verified" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck
                className="size-10 text-emerald-500"
                strokeWidth={1.5}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Email déjà vérifié
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Ce lien a déjà été utilisé. Votre adresse email a déjà été
                confirmée. Connectez-vous pour accéder à votre compte.
              </p>
            </div>
            <Link to="/sign-in">
              <Button
                variant="amber"
                className="w-full bg-amber-500! rounded-md flex"
              >
                <ArrowRight className="size-4" />
                Se connecter
              </Button>
            </Link>
          </div>
        )}

        {result.state === "expired" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ShieldX className="size-10 text-amber-500" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Lien expiré
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Ce lien de vérification a expiré. Saisissez votre adresse email
                pour en recevoir un nouveau.
              </p>
            </div>

            {resent && (
              <div className="w-full flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <RefreshCw className="size-3.5 text-emerald-500 shrink-0" />
                <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 text-left">
                  Si un compte existe avec cette adresse, un email vient d'être
                  envoyé.
                </p>
              </div>
            )}

            <form
              onSubmit={handleResend}
              className="w-full space-y-2.5"
              noValidate
            >
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
                      <Loader2 className="size-4 animate-spin" />
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
          </div>
        )}

        {result.state === "error" && (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="size-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <ShieldX className="size-10 text-red-500" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
                Vérification échouée
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {result.errorMessage ??
                  "Ce lien est invalide ou a déjà été utilisé."}
              </p>
            </div>

            <div className="w-full flex flex-col gap-y-2.5">
              <Link to="/sign-in">
                <Button
                  variant="amber"
                  className="w-full bg-amber-500! rounded-md flex"
                >
                  <ArrowLeft className="size-3.5" />
                  Retour à la connexion
                </Button>
              </Link>

              <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/60 border border-input dark:border-neutral-700">
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                  Le lien a peut-être déjà été utilisé. Si le problème persiste,{" "}
                  <a
                    href="mailto:support@lokale.cg"
                    className="text-amber-500 hover:underline font-medium"
                  >
                    contactez le support
                  </a>
                  .
                </p>
              </div>

              <Link
                to="/sign-up"
                className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Créer un nouveau compte
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
