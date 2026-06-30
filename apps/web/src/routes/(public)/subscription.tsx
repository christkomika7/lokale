import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "#/lib/api-client";
import { cn } from "#/lib/utils";
import {
  Check,
  Zap,
  Crown,
  Building2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  code: "FREE" | "PRO" | "BUSINESS";
  name: string;
  priceFcfa: number;
  billingPeriod: "MONTHLY" | "YEARLY";
  storageLimitMb: number;
  maxPublications: number;
  maxSondages: number;
  maxAnnonces: number;
  maxActions: number;
  canCreateActions: boolean;
  includesCertification: boolean;
  features: string[] | null;
}

interface CheckoutResponse {
  reference: string;
  status: string;
  amountFcfa: number;
  provider: string;
  phone: string;
  expiresAt: string;
  instructions: string;
}

interface QuotaResponse {
  plan: { code: string; name: string; billingPeriod: string };
  subscription: {
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    daysLeft: number;
  };
  usage: {
    storage: { used: number; bonus: number; limit: number; unit: string };
    publications: { used: number; bonus: number; limit: number };
    sondages: { used: number; limit: number };
    annonces: { used: number; limit: number };
    actions: { used: number; limit: number };
  };
  features: { canCreateActions: boolean; includesCertification: boolean };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_META: Record<
  string,
  { icon: typeof Zap; color: string; badge?: string; popular?: boolean }
> = {
  FREE: {
    icon: Zap,
    color: "text-neutral-400",
  },
  PRO: {
    icon: Crown,
    color: "text-amber-500",
    popular: true,
    badge: "Populaire",
  },
  BUSINESS: {
    icon: Building2,
    color: "text-blue-500",
    badge: "Pro",
  },
};

const DEFAULT_FEATURES: Record<string, string[]> = {
  FREE: [
    "5 publications / mois",
    "2 sondages / mois",
    "1 annonce / mois",
    "100 MB de stockage",
  ],
  PRO: [
    "50 publications / mois",
    "20 sondages / mois",
    "10 annonces / mois",
    "1 GB de stockage",
    "Création d'actions",
    "Support prioritaire",
  ],
  BUSINESS: [
    "Publications illimitées",
    "Sondages illimités",
    "Annonces illimitées",
    "10 GB de stockage",
    "Actions avancées",
    "Certification incluse",
    "Support dédié",
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function UsageBar({
  label,
  used,
  limit,
  unit = "",
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const pct = limit === 0 ? 0 : Math.min(100, (used / limit) * 100);
  const color =
    pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-neutral-700 dark:text-neutral-300 font-medium tabular-nums">
          {used}
          {unit} / {limit}
          {unit}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            color,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PaymentModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"form" | "pending" | "success" | "error">(
    "form",
  );
  const [provider, setProvider] = useState<"MTN" | "AIRTEL">("MTN");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const idempotencyKey = `${plan.id}-${Date.now()}`;

  const checkout = useMutation({
    mutationFn: () =>
      api.post<CheckoutResponse>("/subscriptions/checkout", {
        planId: plan.id,
        provider,
        phone,
        idempotencyKey,
      }),
    onSuccess: (data) => {
      setReference(data.reference);
      setInstructions(data.instructions);
      setStep("pending");
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.body?.message ?? "Erreur lors de l'initiation du paiement.",
      );
      setStep("error");
    },
  });

  const confirm = useMutation({
    mutationFn: ({ simulateFailure }: { simulateFailure: boolean }) =>
      api.post("/subscriptions/confirm", { reference, simulateFailure }),
    onSuccess: () => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setErrorMsg(err?.body?.message ?? "Paiement refusé.");
      setStep("error");
    },
  });

  const formatPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 9);
    return d
      .replace(/^(\d{2})(\d{0,3})/, "$1 $2")
      .replace(/^(\d{2} \d{3})(\d{0,2})/, "$1 $2")
      .replace(/^(\d{2} \d{3} \d{2})(\d{0,2})/, "$1 $2")
      .trim();
  };

  const Icon = PLAN_META[plan.code]?.icon ?? Zap;
  const iconColor = PLAN_META[plan.code]?.color ?? "text-neutral-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-sm border border-neutral-100 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
              <Icon className={cn("size-4", iconColor)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-tight">
                Plan {plan.name}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">
                {plan.priceFcfa.toLocaleString("fr-FR")} FCFA /{" "}
                {plan.billingPeriod === "MONTHLY" ? "mois" : "an"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {/* ── Step: Form ── */}
          {step === "form" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Opérateur
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["MTN", "AIRTEL"] as const).map((op) => (
                    <button
                      key={op}
                      onClick={() => setProvider(op)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 border text-xs font-medium transition-all",
                        provider === op
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          op === "MTN" ? "bg-yellow-400" : "bg-red-500",
                        )}
                      />
                      {op} Money
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Numéro de téléphone
                </p>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-700 overflow-hidden focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/10 transition-all">
                  <span className="px-3 py-2.5 text-xs text-neutral-400 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 shrink-0 tabular-nums">
                    +242
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="06 856 80 32"
                    value={formatPhone(phone)}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    className="flex-1 px-3 py-2.5 text-xs bg-transparent outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                  />
                </div>
              </div>

              <div className="border border-amber-100 dark:border-amber-400/15 bg-amber-50/50 dark:bg-amber-400/5 p-3">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                  Paiement simulé — aucune transaction réelle ne sera effectuée.
                </p>
              </div>

              <button
                disabled={phone.length < 9 || checkout.isPending}
                onClick={() => checkout.mutate()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                {checkout.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {checkout.isPending
                  ? "Initiation…"
                  : `Payer ${plan.priceFcfa.toLocaleString("fr-FR")} FCFA`}
              </button>
            </div>
          )}

          {/* ── Step: Pending ── */}
          {step === "pending" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="size-11 border border-amber-100 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center">
                  <RefreshCw className="size-4.5 text-amber-500 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    En attente de confirmation
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                    {reference}
                  </p>
                </div>
              </div>

              <div className="border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-3">
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {instructions}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => confirm.mutate({ simulateFailure: true })}
                  disabled={confirm.isPending}
                  className="flex items-center justify-center gap-1.5 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-500 text-xs hover:border-red-200 hover:text-red-500 dark:hover:border-red-400/30 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <X className="size-3" />
                  Simuler échec
                </button>
                <button
                  onClick={() => confirm.mutate({ simulateFailure: false })}
                  disabled={confirm.isPending}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-400 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {confirm.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Check className="size-3" />
                  )}
                  {confirm.isPending ? "Confirmation…" : "Confirmer"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="size-12 border border-emerald-100 dark:border-emerald-400/20 bg-emerald-50 dark:bg-emerald-400/10 flex items-center justify-center">
                <ShieldCheck className="size-5.5 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Abonnement activé
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Bienvenue dans le plan {plan.name}
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Error ── */}
          {step === "error" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="size-11 border border-red-100 dark:border-red-400/20 bg-red-50 dark:bg-red-400/10 flex items-center justify-center">
                  <AlertCircle className="size-4.5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    Paiement échoué
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {errorMsg}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep("form")}
                className="w-full py-2.5 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export const Route = createFileRoute("/(public)/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get<Plan[]>("/subscriptions/plans"),
  });

  const { data: quota } = useQuery({
    queryKey: ["subscription", "quota"],
    queryFn: () => api.get<QuotaResponse>("/subscriptions/me/quota"),
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post("/subscriptions/cancel", {}),
    onSuccess: () => {
      toast.success("Abonnement annulé.");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err: any) => {
      toast.error(err?.body?.message ?? "Erreur lors de l'annulation.");
    },
  });

  const hasActiveSub = !!quota;
  const currentPlanCode = quota?.plan.code;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 tracking-tight">
          Abonnements
        </h1>
        <p className="text-xs text-neutral-400">
          Choisissez le plan adapté à vos besoins.
        </p>
      </div>

      {/* Quota actif */}
      {hasActiveSub && quota && (
        <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-amber-500 shrink-0" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Plan actif — {quota.plan.name}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[11px] text-neutral-400 tabular-nums">
                {quota.subscription.daysLeft}j restants
              </span>
              <button
                onClick={() => {
                  if (confirm("Annuler votre abonnement ?"))
                    cancelMutation.mutate();
                }}
                disabled={cancelMutation.isPending}
                className="text-[11px] text-red-500 hover:text-red-600 hover:underline disabled:opacity-50 transition-colors"
              >
                {cancelMutation.isPending ? "Annulation…" : "Annuler"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UsageBar
              label="Stockage"
              used={quota.usage.storage.used}
              limit={quota.usage.storage.limit}
              unit=" MB"
            />
            <UsageBar
              label="Publications"
              used={quota.usage.publications.used}
              limit={quota.usage.publications.limit}
            />
            <UsageBar
              label="Sondages"
              used={quota.usage.sondages.used}
              limit={quota.usage.sondages.limit}
            />
            <UsageBar
              label="Annonces"
              used={quota.usage.annonces.used}
              limit={quota.usage.annonces.limit}
            />
          </div>

          {(quota.features.canCreateActions ||
            quota.features.includesCertification) && (
            <div className="flex gap-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {quota.features.canCreateActions && (
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" />
                  Actions activées
                </span>
              )}
              {quota.features.includesCertification && (
                <span className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="size-3" />
                  Certification incluse
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          Plans disponibles
        </p>

        {plansLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-4 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const meta = PLAN_META[plan.code] ?? PLAN_META.FREE;
              const Icon = meta.icon;
              const isCurrent = plan.code === currentPlanCode;
              const isFree = plan.code === "FREE";
              const features =
                (plan.features as string[] | null) ??
                DEFAULT_FEATURES[plan.code] ??
                [];

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative border flex flex-col gap-5 p-5 transition-all duration-150",
                    isCurrent
                      ? "border-amber-300 dark:border-amber-400/40 bg-amber-50/50 dark:bg-amber-400/5"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
                  )}
                >
                  {/* Badge */}
                  {isCurrent ? (
                    <span className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-400/20">
                      Actif
                    </span>
                  ) : meta.badge ? (
                    <span className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-400/20">
                      {meta.badge}
                    </span>
                  ) : null}

                  {/* Plan info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("size-3.5", meta.color)} />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                        {plan.name}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 tabular-nums tracking-tight">
                        {isFree
                          ? "Gratuit"
                          : plan.priceFcfa.toLocaleString("fr-FR")}
                      </span>
                      {!isFree && (
                        <span className="text-[11px] text-neutral-400">
                          FCFA /{" "}
                          {plan.billingPeriod === "MONTHLY" ? "mois" : "an"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400"
                      >
                        <Check className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    disabled={isCurrent || isFree}
                    onClick={() =>
                      !isCurrent && !isFree && setSelectedPlan(plan)
                    }
                    className={cn(
                      "w-full py-2 text-xs font-semibold transition-colors",
                      isCurrent
                        ? "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 cursor-default"
                        : isFree
                          ? "bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-default"
                          : "bg-amber-400 hover:bg-amber-500 text-white cursor-pointer",
                    )}
                  >
                    {isCurrent
                      ? "Plan actuel"
                      : isFree
                        ? "Plan de base"
                        : `Choisir ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal paiement */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            setSelectedPlan(null);
            toast.success("Bienvenue dans votre nouvel abonnement !");
          }}
        />
      )}
    </div>
  );
}
