import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, ShieldCheck, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Activity } from "#/components/ui/activity";
import { authClient } from "#/lib/auth-client";
import { AuthCard } from "#/components/card/auth-card";
import { AuthLayout } from "#/components/layout/auth-layout";
import { Button } from "#/components/ui/button";
import { useCountdown } from "#/hook/use-countdown";
import { getAuthErrorMessage } from "@lokale/lib/auth-error";
import { InputErrorMessage } from "#/components/message/input-error-message";
import { maskEmail } from "@lokale/lib/helpers";
import { OTP_RESEND_COOLDOWN } from "@lokale/config/auth/otp";
import { otpSchema } from "@lokale/lib/validator/auth";
import { BanDuration } from "#/components/message/ban-duration";
import type { RateLimiterResponse } from "@lokale/types/security";
import { usePendingVerificationStore } from "#/store/pending-verification.store";

import InputOTP from "#/components/input/input-otp";
import ErrorMessage from "#/components/message/error-message";
import EllipsisLoader from "#/components/loader/ellipsis-loader";
import { secureAuth } from "#/lib/secure";

export const Route = createFileRoute("/(auth)/verify-otp")({
  beforeLoad: ({ context }) => {
    secureAuth(context.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const email = usePendingVerificationStore((s) => s.email);
  const clearEmail = usePendingVerificationStore((s) => s.clearEmail);
  const [verified, setVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [banInfo, setBanInfo] = useState<RateLimiterResponse | null>(null);

  const { seconds, formatted, canResend, restart } = useCountdown({
    key: `otp-resend:${email}`,
    initial: OTP_RESEND_COOLDOWN,
  });

  const maskedEmail = maskEmail(email ?? "");

  useEffect(() => {
    if (!email && !verified) {
      navigate({ to: "/sign-up" });
    }
  }, [email, verified]);

  const form = useForm({
    defaultValues: { otp: "" },
    validators: { onSubmit: otpSchema },
    onSubmit: async ({ value }) => {
      setGlobalError(null);

      const { error } = await authClient.emailOtp.verifyEmail({
        email: email!,
        otp: value.otp,
      });

      if (error) {
        if (error.status === 403 || error.status === 429) {
          setBanInfo(error as unknown as RateLimiterResponse);
        }
        const message = getAuthErrorMessage(error);
        toast.error(message);
        setGlobalError(message);
        return;
      }

      setVerified(true);
      clearEmail();
      toast.success("Compte vérifié avec succès !");
    },
  });

  async function handleResend() {
    setIsResending(true);
    setGlobalError(null);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email!,
      type: "email-verification",
    });

    if (error) {
      if (error.status === 403 || error.status === 429) {
        setBanInfo(error as unknown as RateLimiterResponse);
      }

      const message =
        getAuthErrorMessage(error) ?? "Impossible de renvoyer le code.";
      toast.error(message);
      setGlobalError(message);
    } else {
      setResent(true);
      restart();
    }

    setIsResending(false);
  }

  if (verified) {
    return (
      <AuthLayout
        title="Trouvez facilement les lieux où il y a de l'ambiance."
        subtitle="Bars branchés, restaurants bondés, événements locaux."
      >
        <AuthCard title="" description="">
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
                Compte vérifié ! 🎉
              </h1>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Votre adresse email a été confirmée avec succès. Vous pouvez
                maintenant vous connecter à Lokale.
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
      title="Trouvez facilement les lieux où il y a de l'ambiance."
      subtitle="Bars branchés, restaurants bondés, événements locaux."
    >
      <AuthCard
        title="Vérifiez votre email"
        description={`Saisissez le code à 6 chiffres envoyé à ${maskedEmail}`}
        className="space-y-1"
      >
        {banInfo ? (
          <BanDuration
            banExpires={banInfo.banExpires}
            reason={banInfo.reason}
            onBanEnd={() => setBanInfo(null)}
          />
        ) : (
          <>
            <div className="flex items-center gap-3 p-2.5 mb-3 rounded-md dark:bg-neutral-800/60 border border-input dark:border-neutral-700">
              <div className="size-8 rounded-sm bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Mail className="size-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 -space-y-0.5">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-200">
                    Code envoyé à
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                    {maskedEmail}
                  </p>
                </div>
                <Activity mode={seconds > 0 ? "visible" : "hidden"}>
                  <span className="ml-auto text-[12px] font-mono font-bold shrink-0 tabular-nums transition-colors text-amber-500 dark:text-amber-400">
                    {formatted}
                  </span>
                </Activity>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              noValidate
              className="mb-2"
            >
              <form.Field name="otp">
                {(field) => (
                  <div className="space-y-3">
                    <InputOTP
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value);
                        setGlobalError(null);
                      }}
                      onComplete={() => form.handleSubmit()}
                      isInvalid={
                        (field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0) ||
                        !!banInfo
                          ? "true"
                          : "false"
                      }
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.map((error) => (
                        <InputErrorMessage
                          key={error?.message}
                          message={error?.message}
                        />
                      ))}
                  </div>
                )}
              </form.Field>

              {resent && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <RefreshCw className="size-3.5 text-emerald-500 shrink-0" />
                  <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                    Nouveau code envoyé à votre adresse email.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <form.Subscribe
                  selector={(s) => ({
                    isSubmitting: s.isSubmitting,
                    otp: s.values.otp,
                  })}
                >
                  {({ isSubmitting, otp }) => (
                    <Button
                      type="submit"
                      variant="amber"
                      className="w-full rounded-md"
                      disabled={isSubmitting || otp.length < 6 || !!banInfo}
                    >
                      {isSubmitting ? (
                        <span className="flex items-end gap-2">
                          <EllipsisLoader
                            size={5}
                            color="bg-white"
                            speed="normal"
                          />
                          <span className="text-[13px] font-medium">
                            Vérification en cours
                          </span>
                        </span>
                      ) : (
                        <>
                          <ShieldCheck className="size-4" />
                          Vérifier mon compte
                        </>
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
            <div className="text-center mb-3">
              {canResend ? (
                <Button
                  variant="info"
                  onClick={handleResend}
                  disabled={isResending || !!banInfo}
                  className="w-full rounded-md"
                >
                  {isResending ? (
                    <EllipsisLoader text="Envoi en cours" speed="fast" />
                  ) : (
                    <>
                      <RefreshCw className="size-3.5" />
                      Renvoyer un nouveau code
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500">
                  Renvoyer dans{" "}
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300 tabular-nums">
                    {formatted}
                  </span>
                </p>
              )}
              <Activity mode={globalError ? "visible" : "hidden"}>
                <ErrorMessage
                  message={globalError!}
                  onDismiss={() => setGlobalError(null)}
                  className="mt-1.5"
                />
              </Activity>
            </div>
            <div className="pt-2 border-t border-input dark:border-neutral-800 space-y-3">
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center leading-relaxed">
                Vous ne trouvez pas le code ? Vérifiez vos spams ou{" "}
                <a
                  href="mailto:support@lokale.cg"
                  className="text-amber-500 hover:underline font-medium"
                >
                  contactez le support
                </a>
                .
              </p>
              <Link
                to="/sign-in"
                className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
