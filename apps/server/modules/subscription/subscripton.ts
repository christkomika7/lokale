import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { $Enums } from "../../generated/prisma/client";
import { addMonths } from "@lokale/lib/date";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FakePaymentStore {
  [reference: string]: {
    userId: string;
    planId: string;
    amountFcfa: number;
    provider: string;
    phone: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: number;
    idempotencyKey: string;
  };
}

// Stockage en mémoire des paiements fake en attente
// En production → Redis ou table PendingPayment
const fakePaymentStore: FakePaymentStore = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LKL-${ts}-${rand}`;
}

async function getSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

async function cancelExistingSubscriptions(userId: string, tx: any) {
  await tx.subscription.updateMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
    },
    data: { status: "CANCELLED" },
  });
}

async function createUsageQuota(
  subscriptionId: string,
  startDate: Date,
  endDate: Date,
  tx: any,
) {
  await tx.usageQuota.create({
    data: {
      subscriptionId,
      periodStart: startDate,
      periodEnd: endDate,
    },
  });
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const subscription = new Elysia({ prefix: "/subscriptions" })

  // ── GET /plans ─────────────────────────────────────────────────────────────
  .get("/plans", async () => {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceFcfa: "asc" },
    });
    return plans;
  })

  // ── GET /me ────────────────────────────────────────────────────────────────
  .get("/me", async ({ request, status }) => {
    const session = await getSession(request);
    if (!session) return status(401, { message: "Non authentifié." });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        plan: true,
        quotas: {
          orderBy: { periodStart: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return status(404, { message: "Aucun abonnement actif." });
    }

    return subscription;
  })

  // ── GET /me/quota ──────────────────────────────────────────────────────────
  .get("/me/quota", async ({ request, status }) => {
    const session = await getSession(request);
    if (!session) return status(401, { message: "Non authentifié." });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        plan: true,
        quotas: {
          where: {
            periodStart: { lte: new Date() },
            periodEnd: { gte: new Date() },
          },
          take: 1,
        },
        addonPurchases: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
          include: { addon: true },
        },
      },
    });

    if (!subscription) {
      return status(404, { message: "Aucun abonnement actif." });
    }

    const quota = subscription.quotas[0];
    const plan = subscription.plan;

    // Bonus cumulés depuis les addons actifs
    const bonusStorage = subscription.addonPurchases
      .filter((p) => p.addon.kind === "STORAGE")
      .reduce((sum, p) => sum + p.addon.quantity * p.quantity, 0);

    const bonusPublications = subscription.addonPurchases
      .filter((p) => p.addon.kind === "PUBLICATION")
      .reduce((sum, p) => sum + p.addon.quantity * p.quantity, 0);

    return {
      plan: {
        code: plan.code,
        name: plan.name,
        billingPeriod: plan.billingPeriod,
      },
      subscription: {
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        daysLeft: Math.max(
          0,
          Math.ceil(
            (subscription.endDate.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      },
      usage: {
        storage: {
          used: quota?.storageUsedMb ?? 0,
          bonus: bonusStorage,
          limit: plan.storageLimitMb + bonusStorage,
          unit: "MB",
        },
        publications: {
          used: quota?.publicationsUsed ?? 0,
          bonus: bonusPublications,
          limit: plan.maxPublications + bonusPublications,
        },
        sondages: {
          used: quota?.sondagesUsed ?? 0,
          limit: plan.maxSondages,
        },
        annonces: {
          used: quota?.annoncesUsed ?? 0,
          limit: plan.maxAnnonces,
        },
        actions: {
          used: quota?.actionsUsed ?? 0,
          limit: plan.maxActions,
        },
      },
      features: {
        canCreateActions: plan.canCreateActions,
        includesCertification: plan.includesCertification,
      },
    };
  })

  // ── POST /checkout ─────────────────────────────────────────────────────────
  // Initie un paiement fake, retourne une référence à confirmer
  .post(
    "/checkout",
    async ({ body, request, status }) => {
      const session = await getSession(request);
      if (!session) return status(401, { message: "Non authentifié." });

      const { planId, provider, phone, idempotencyKey } = body;

      // Idempotency : même clé = même réponse
      const existing = Object.values(fakePaymentStore).find(
        (p) =>
          p.userId === session.user.id &&
          p.idempotencyKey === idempotencyKey &&
          p.status === "PENDING",
      );
      if (existing) {
        const ref = Object.entries(fakePaymentStore).find(
          ([, v]) => v.idempotencyKey === idempotencyKey,
        )?.[0];
        return { reference: ref, status: "PENDING", alreadyExists: true };
      }

      // Vérifier que le plan existe
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan || !plan.isActive) {
        return status(404, { message: "Plan introuvable ou inactif." });
      }

      // Bloquer FREE (pas de paiement pour le plan gratuit)
      if (plan.code === "FREE") {
        return status(400, {
          message: "Le plan gratuit ne nécessite pas de paiement.",
        });
      }

      // Vérifier qu'il n'y a pas déjà un paiement PENDING pour cet user+plan
      const pendingPayment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          status: "PENDING",
          subscription: { planId },
        },
      });
      if (pendingPayment) {
        return status(409, {
          message: "Un paiement est déjà en attente pour ce plan.",
          reference: pendingPayment.reference,
        });
      }

      const reference = generateReference();

      fakePaymentStore[reference] = {
        userId: session.user.id,
        planId,
        amountFcfa: plan.priceFcfa,
        provider,
        phone,
        status: "PENDING",
        createdAt: Date.now(),
        idempotencyKey,
      };

      // Expiration automatique après 15 min
      setTimeout(
        () => {
          if (fakePaymentStore[reference]?.status === "PENDING") {
            fakePaymentStore[reference].status = "FAILED";
          }
        },
        15 * 60 * 1000,
      );

      return {
        reference,
        status: "PENDING",
        amountFcfa: plan.priceFcfa,
        provider,
        phone,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        instructions:
          provider === "MTN"
            ? `Composez *126*${plan.priceFcfa}# sur votre téléphone MTN pour confirmer le paiement de ${plan.priceFcfa} FCFA.`
            : `Composez *150*${plan.priceFcfa}# sur votre téléphone Airtel pour confirmer le paiement de ${plan.priceFcfa} FCFA.`,
      };
    },
    {
      body: t.Object({
        planId: t.String(),
        provider: t.Union([t.Literal("MTN"), t.Literal("AIRTEL")]),
        phone: t.String({ minLength: 9, maxLength: 9 }),
        idempotencyKey: t.String(),
      }),
    },
  )

  // ── POST /confirm ──────────────────────────────────────────────────────────
  // Simule la confirmation du paiement + active l'abonnement
  .post(
    "/confirm",
    async ({ body, request, status }) => {
      const session = await getSession(request);
      if (!session) return status(401, { message: "Non authentifié." });

      const { reference, simulateFailure } = body;

      const pending = fakePaymentStore[reference];

      if (!pending) {
        return status(404, { message: "Référence de paiement introuvable." });
      }

      if (pending.userId !== session.user.id) {
        return status(403, {
          message: "Cette référence ne vous appartient pas.",
        });
      }

      if (pending.status === "FAILED") {
        return status(400, { message: "Ce paiement a expiré ou échoué." });
      }

      if (pending.status === "SUCCESS") {
        return status(409, { message: "Ce paiement a déjà été traité." });
      }

      // Simulation d'échec optionnelle (pour les tests)
      if (simulateFailure) {
        fakePaymentStore[reference].status = "FAILED";
        return status(400, {
          message: "Paiement refusé par l'opérateur (simulation).",
          code: "PAYMENT_FAILED",
        });
      }

      // ── Tout dans une transaction ─────────────────────────────────────────
      const result = await prisma.$transaction(async (tx) => {
        const plan = await tx.plan.findUnique({
          where: { id: pending.planId },
        });
        if (!plan) throw new Error("Plan introuvable.");

        // Annuler les abonnements actifs existants
        await cancelExistingSubscriptions(session.user.id, tx);

        const startDate = new Date();
        const endDate = addMonths(
          startDate,
          plan.billingPeriod === "YEARLY" ? 12 : 1,
        );

        // Créer le nouvel abonnement
        const subscription = await tx.subscription.create({
          data: {
            userId: session.user.id,
            planId: plan.id,
            status: "ACTIVE",
            startDate,
            endDate,
            autoRenew: true,
          },
        });

        // Créer le quota de la période
        await createUsageQuota(subscription.id, startDate, endDate, tx);

        // Enregistrer le paiement en base
        const payment = await tx.payment.create({
          data: {
            userId: session.user.id,
            subscriptionId: subscription.id,
            amountFcfa: pending.amountFcfa,
            provider: pending.provider,
            reference,
            status: "SUCCESS",
          },
        });

        // Passer le user en WORKSPACE
        await tx.user.update({
          where: { id: session.user.id },
          data: { role: $Enums.Role.WORKSPACE },
        });

        return { subscription, payment, plan };
      });

      // Marquer le paiement fake comme traité
      fakePaymentStore[reference].status = "SUCCESS";

      return {
        success: true,
        message: `Abonnement ${result.plan.name} activé avec succès !`,
        subscription: {
          id: result.subscription.id,
          planCode: result.plan.code,
          planName: result.plan.name,
          startDate: result.subscription.startDate,
          endDate: result.subscription.endDate,
        },
        payment: {
          reference: result.payment.reference,
          amountFcfa: result.payment.amountFcfa,
          provider: result.payment.provider,
        },
      };
    },
    {
      body: t.Object({
        reference: t.String(),
        simulateFailure: t.Optional(t.Boolean()),
      }),
    },
  )

  // ── POST /cancel ───────────────────────────────────────────────────────────
  .post("/cancel", async ({ request, status }) => {
    const session = await getSession(request);
    if (!session) return status(401, { message: "Non authentifié." });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      return status(404, { message: "Aucun abonnement actif à annuler." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELLED", autoRenew: false },
      });

      // Repasser en USER
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: $Enums.Role.USER },
      });
    });

    return { success: true, message: "Abonnement annulé." };
  })

  // ── GET /payment/status/:reference ────────────────────────────────────────
  .get(
    "/payment/status/:reference",
    async ({ params, request, status }) => {
      const session = await getSession(request);
      if (!session) return status(401, { message: "Non authentifié." });

      const pending = fakePaymentStore[params.reference];
      if (!pending || pending.userId !== session.user.id) {
        return status(404, { message: "Référence introuvable." });
      }

      return {
        reference: params.reference,
        status: pending.status,
        amountFcfa: pending.amountFcfa,
        provider: pending.provider,
        createdAt: new Date(pending.createdAt).toISOString(),
      };
    },
    {
      params: t.Object({ reference: t.String() }),
    },
  );
