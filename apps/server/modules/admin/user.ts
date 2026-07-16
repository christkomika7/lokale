import { Elysia, t } from "elysia";
import { $Enums, Prisma } from "../../generated/prisma/client";
import { Role, UserStatus, Plan, User } from "@lokale/types/user";
import { PaginatedResponse } from "@lokale/types/response";
import { prisma } from "../../lib/prisma";
import { computeUserStatus, buildStatusWhere } from "../../lib/user-status";
import { auth } from "../../lib/auth";
import { sendWelcomeEmail } from "../../lib/mailer";
import { userSchema, idSchema } from "@lokale/lib/validator/user";
import { addMonths } from "@lokale/lib/date";
import { SORTABLE_FIELDS } from "@lokale/config/filter";
import type { SortableKey } from "@lokale/types/filter";
import { envPlugin as env } from "../../plugins/env";

export const userRoute = new Elysia({ prefix: "/users" })
  .use(env)
  .get(
    "/",
    async ({ query }) => {
      const {
        page = 1,
        pageSize = 20,
        search,
        role,
        status,
        plan,
        banned,
        sortBy = "joinedAt",
        sortOrder = "desc",
      } = query;

      const currentPage = Math.max(1, Number(page));
      const currentPageSize = Math.min(100, Math.max(1, Number(pageSize)));

      const where: Prisma.UserWhereInput = {};
      const andConditions: Prisma.UserWhereInput[] = [];

      if (search) {
        andConditions.push({
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        });
      }

      if (role) {
        where.role = role as Role;
      }

      if (status) {
        andConditions.push(buildStatusWhere(status as UserStatus));
      }

      if (typeof banned === "boolean") {
        where.banned = banned;
      }

      if (plan) {
        where.subscriptions = {
          some: {
            status: "ACTIVE",
            plan: { code: plan as Plan },
          },
        };
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      const orderField = SORTABLE_FIELDS[sortBy as SortableKey] ?? "createdAt";
      const orderBy: Prisma.UserOrderByWithRelationInput = {
        [orderField]: sortOrder === "asc" ? "asc" : "desc",
      };

      const [usersData, totalItems, totalUsersAllTime] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy,
          skip: (currentPage - 1) * currentPageSize,
          take: currentPageSize,
          include: {
            ips: { include: { ip: true } },
            sessions: {
              select: { userAgent: true },
              distinct: ["userAgent"],
            },
            subscriptions: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { plan: true },
            },
            _count: {
              select: { actionSubmissions: true },
            },
          },
        }),
        prisma.user.count({ where }),
        prisma.user.count(),
      ]);

      const items: User[] = usersData.map((user) => {
        const activePlan = user.subscriptions[0]?.plan.code ?? "FREE";
        const role =
          user.role === "ADMIN"
            ? Role.ADMIN
            : user.role === "USER"
              ? Role.USER
              : Role.WORKSPACE;
        return {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          avatar: user.image ?? "",
          role,
          status: computeUserStatus({
            banned: user.banned,
            banExpires: user.banExpires,
            emailVerified: user.emailVerified,
          }),
          plan: activePlan as Plan,
          country: user.country ?? "",
          city: user.city ?? "",
          joinedAt: user.createdAt.toISOString(),
          lastSeen: (user.lastSeenAt ?? user.createdAt).toISOString(),
          actions: user._count.actionSubmissions,
          emailVerified: user.emailVerified,
          hasActiveSubscription: user.subscriptions.length > 0,
          idVerified: user.idVerified,
          ips: user.ips.map((entry) => entry.ip.ip),
          devices: user.sessions
            .map((s) => s.userAgent)
            .filter((ua): ua is string => Boolean(ua)),
          suspiciousActivity: user.suspiciousActivity,
        };
      });

      const response: PaginatedResponse<User> & {
        totalUsersAllTime: number;
      } = {
        items,
        page: currentPage,
        pageSize: currentPageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / currentPageSize)),
        totalUsersAllTime,
      };

      return response;
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        pageSize: t.Optional(t.Numeric()),
        search: t.Optional(t.String()),
        role: t.Optional(t.String()),
        status: t.Optional(
          t.Union([
            t.Literal("active"),
            t.Literal("suspended"),
            t.Literal("banned"),
            t.Literal("pending"),
          ]),
        ),
        plan: t.Optional(t.String()),
        banned: t.Optional(t.Boolean()),
        sortBy: t.Optional(
          t.Union([
            t.Literal("name"),
            t.Literal("joinedAt"),
            t.Literal("activity"),
          ]),
        ),
        sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
      }),
    },
  )
  .post(
    "/",
    async ({ body, status }) => {
      const {
        lastname,
        firstname,
        email,
        phone,
        city,
        role,
        plan,
        password,
        emailVerified,
      } = body;
      const name = `${firstname} ${lastname}`.trim();

      let userId: string;
      try {
        const ctx = await auth.$context;
        const hashed = await ctx.password.hash(password);

        const existing = await prisma.user.findFirst({
          where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
        });
        if (existing) {
          if (existing.email === email) {
            return status(400, {
              code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
              message: "Email already exists",
            });
          }
          return status(400, {
            code: "PHONE_ALREADY_EXISTS",
            message: "Phone already exists",
          });
        }

        const newUser = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            name,
            email,
            firstname,
            lastname,
            phone: phone || null,
            city: city || null,
            emailVerified: emailVerified ?? false,
            role:
              role === "ADMIN"
                ? $Enums.Role.ADMIN
                : role === "WORKSPACE"
                  ? $Enums.Role.WORKSPACE
                  : $Enums.Role.USER,
            accounts: {
              create: {
                id: crypto.randomUUID(),
                accountId: crypto.randomUUID(),
                providerId: "credential",
                password: hashed,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          },
        });

        userId = newUser.id;
      } catch (err: any) {
        if (err.code === "P2002") {
          const field = err.meta?.target?.[0];
          return status(400, {
            code:
              field === "phone"
                ? "PHONE_ALREADY_EXISTS"
                : "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
            message:
              field === "phone"
                ? "Phone already exists"
                : "Email already exists",
          });
        }
        console.error(err);
        return status(500, {
          message: "Une erreur est survenue",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const updated = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { plan: true },
          },
          _count: { select: { actionSubmissions: true } },
        },
      });

      if (plan && plan !== "FREE") {
        const planRecord = await prisma.plan.findUnique({
          where: { code: plan as $Enums.PlanCode },
        });

        if (planRecord) {
          const startDate = new Date();
          const endDate = addMonths(startDate, 1);

          await prisma.$transaction(async (tx) => {
            await tx.subscription.updateMany({
              where: {
                userId,
                status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
              },
              data: { status: "CANCELLED" },
            });

            const subscription = await tx.subscription.create({
              data: {
                userId,
                planId: planRecord.id,
                status: "ACTIVE",
                startDate,
                endDate,
                autoRenew: false,
              },
            });

            await tx.usageQuota.create({
              data: {
                subscriptionId: subscription.id,
                periodStart: startDate,
                periodEnd: endDate,
              },
            });

            await tx.user.update({
              where: { id: userId },
              data: { role: $Enums.Role.WORKSPACE },
            });
          });

          const withSub = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              subscriptions: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: "desc" },
                take: 1,
                include: { plan: true },
              },
            },
          });
          if (withSub) Object.assign(updated, withSub);
        }
      }
      if (emailVerified) {
        await sendWelcomeEmail({ address: email, name }, name);
      } else {
        await auth.api
          .sendVerificationEmail({
            body: { email },
            headers: new Headers({ "Content-Type": "application/json" }),
          })
          .catch(console.error);
      }

      const activePlan = updated.subscriptions[0]?.plan.code ?? "FREE";
      const mappedRole =
        updated.role === $Enums.Role.ADMIN
          ? Role.ADMIN
          : updated.role === $Enums.Role.WORKSPACE
            ? Role.WORKSPACE
            : Role.USER;

      const user: User = {
        id: updated.id,
        firstname: updated.firstname,
        lastname: updated.lastname,
        name: updated.name,
        email: updated.email,
        phone: updated.phone ?? "",
        avatar: updated.image ?? "",
        role: mappedRole,
        status: computeUserStatus({
          banned: updated.banned,
          banExpires: updated.banExpires,
          emailVerified: updated.emailVerified,
        }),
        plan: activePlan as any,
        country: updated.country ?? "",
        city: updated.city ?? "",
        joinedAt: updated.createdAt.toISOString(),
        lastSeen: (updated.lastSeenAt ?? updated.createdAt).toISOString(),
        actions: updated._count.actionSubmissions,
        emailVerified: updated.emailVerified,
        hasActiveSubscription: updated.subscriptions.length > 0,
        idVerified: updated.idVerified,
        ips: [],
        devices: [],
        suspiciousActivity: updated.suspiciousActivity,
      };

      return new Response(JSON.stringify(user), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
    { body: userSchema },
  )
  .patch(
    "/:id",
    async ({ params, body, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });

      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const { firstname, lastname, phone, city, emailVerified } = body;

      if (phone && phone !== user?.phone) {
        const existing = await prisma.user.findFirst({
          where: { phone, NOT: { id: user.id } },
        });
        if (existing) {
          return status(400, {
            code: "PHONE_ALREADY_EXISTS",
            message: "Ce numéro de téléphone est déjà utilisé",
          });
        }
      }

      const nextFirstname = firstname ?? user.firstname;
      const nextLastname = lastname ?? user.lastname;

      const updated = await prisma.user.update({
        where: { id: params.id },
        data: {
          firstname: nextFirstname,
          lastname: nextLastname,
          name: `${nextFirstname} ${nextLastname}`.trim(),
          phone: phone !== undefined ? phone || null : undefined,
          city: city !== undefined ? city || null : undefined,
          emailVerified:
            emailVerified === true && !user.emailVerified ? true : undefined,
        },
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { plan: true },
          },
          _count: { select: { actionSubmissions: true } },
        },
      });

      const activePlan = updated.subscriptions[0]?.plan.code ?? "FREE";
      const mappedRole =
        updated.role === $Enums.Role.ADMIN
          ? Role.ADMIN
          : updated.role === $Enums.Role.WORKSPACE
            ? Role.WORKSPACE
            : Role.USER;

      const response: User = {
        id: updated.id,
        firstname: updated.firstname,
        lastname: updated.lastname,
        name: updated.name,
        email: updated.email,
        phone: updated.phone ?? "",
        avatar: updated.image ?? "",
        role: mappedRole,
        status: computeUserStatus({
          banned: updated.banned,
          banExpires: updated.banExpires,
          emailVerified: updated.emailVerified,
        }),
        plan: activePlan as any,
        country: updated.country ?? "",
        city: updated.city ?? "",
        joinedAt: updated.createdAt.toISOString(),
        lastSeen: (updated.lastSeenAt ?? updated.createdAt).toISOString(),
        actions: updated._count.actionSubmissions,
        emailVerified: updated.emailVerified,
        hasActiveSubscription: updated.subscriptions.length > 0,
        idVerified: updated.idVerified,
        ips: [],
        devices: [],
        suspiciousActivity: updated.suspiciousActivity,
      };

      return response;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        firstname: t.Optional(t.String()),
        lastname: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        city: t.Optional(t.String()),
        emailVerified: t.Optional(t.Boolean()),
      }),
    },
  )

  .patch(
    "/plan/:id",
    async ({ params, body, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const keepRole = user.role === $Enums.Role.ADMIN;

      const isPaidPlan = body.plan !== "FREE";
      const roleAllowsPaidPlan =
        user.role === $Enums.Role.WORKSPACE || user.role === $Enums.Role.ADMIN;

      if (isPaidPlan && !roleAllowsPaidPlan) {
        return status(400, {
          code: "PLAN_ROLE_MISMATCH",
          message:
            "Ce plan est réservé aux comptes Entreprise. Passez d'abord le rôle de l'utilisateur en Entreprise avant de lui assigner ce plan.",
        });
      }

      if (body.plan === "FREE") {
        const result = await prisma.$transaction(async (tx) => {
          const cancelled = await tx.subscription.updateMany({
            where: {
              userId: user.id,
              status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
            },
            data: { status: "CANCELLED" },
          });

          if (!keepRole) {
            await tx.user.update({
              where: { id: user.id },
              data: { role: $Enums.Role.USER },
            });
          }

          return cancelled.count;
        });

        return {
          message: "Utilisateur repassé au plan FREE",
          previousSubscriptionCancelled: result > 0,
        };
      }

      const planRecord = await prisma.plan.findUnique({
        where: { code: body.plan },
      });

      if (!planRecord) {
        return status(400, {
          code: "PLAN_NOT_FOUND",
          message: "Plan introuvable",
        });
      }

      const startDate = new Date();
      const endDate = addMonths(startDate, 1);

      const cancelledCount = await prisma.$transaction(async (tx) => {
        const cancelled = await tx.subscription.updateMany({
          where: {
            userId: user.id,
            status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
          },
          data: { status: "CANCELLED" },
        });

        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
            planId: planRecord.id,
            status: "ACTIVE",
            startDate,
            endDate,
            autoRenew: false,
          },
        });

        await tx.usageQuota.create({
          data: {
            subscriptionId: subscription.id,
            periodStart: startDate,
            periodEnd: endDate,
          },
        });

        if (!keepRole) {
          await tx.user.update({
            where: { id: user.id },
            data: { role: $Enums.Role.WORKSPACE },
          });
        }

        return cancelled.count;
      });

      return {
        message: `Plan changé pour ${body.plan}`,
        previousSubscriptionCancelled: cancelledCount > 0,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        plan: t.Union([
          t.Literal("FREE"),
          t.Literal("STARTER"),
          t.Literal("PRO"),
          t.Literal("BUSINESS"),
        ]),
      }),
    },
  )
  .post(
    "/cancel-subscription/:id",
    async ({ params, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });

      if (!activeSubscription) {
        return status(400, {
          code: "NO_ACTIVE_SUBSCRIPTION",
          message: "Aucun abonnement actif pour cet utilisateur",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { id: activeSubscription.id },
          data: { status: "CANCELLED", autoRenew: false },
        });

        if (user.role !== $Enums.Role.ADMIN) {
          await tx.user.update({
            where: { id: user.id },
            data: { role: $Enums.Role.USER },
          });
        }
      });

      return { message: "Abonnement annulé" };
    },
    { params: idSchema },
  )
  .patch(
    "/role/:id",
    async ({ params, body, status }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          subscriptions: {
            where: { status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const newRole =
        body.role === "ADMIN"
          ? $Enums.Role.ADMIN
          : body.role === "WORKSPACE"
            ? $Enums.Role.WORKSPACE
            : $Enums.Role.USER;

      if (user.role === newRole) {
        return {
          message: "Le rôle est déjà à jour",
          subscriptionCancelled: false,
        };
      }

      const activeSubscription = user.subscriptions[0] ?? null;
      const shouldCancelSubscription =
        user.role === $Enums.Role.WORKSPACE &&
        newRole !== $Enums.Role.WORKSPACE &&
        activeSubscription !== null;

      await prisma.$transaction(async (tx) => {
        if (shouldCancelSubscription && activeSubscription) {
          await tx.subscription.update({
            where: { id: activeSubscription.id },
            data: { status: "CANCELLED", autoRenew: false },
          });
        }

        await tx.user.update({
          where: { id: params.id },
          data: { role: newRole },
        });
      });

      return {
        message: `Rôle mis à jour: ${body.role}`,
        subscriptionCancelled: shouldCancelSubscription,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        role: t.Union([
          t.Literal("ADMIN"),
          t.Literal("USER"),
          t.Literal("WORKSPACE"),
        ]),
      }),
    },
  )
  .post(
    "/suspend/:id",
    async ({ params, body, status }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      });

      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const durationDays = body.durationDays ?? 30;
      const activeSubscription = user.subscriptions[0];
      const banExpires = new Date(
        Date.now() + durationDays * 24 * 60 * 60 * 1000,
      );

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: params.id },
          data: {
            banned: true,
            banReason: body.reason ?? "Suspension administrative",
            banExpires,
          },
        });

        if (user.role === "WORKSPACE" && activeSubscription) {
          await tx.subscription.update({
            where: { id: activeSubscription.id },
            data: {
              status: "PAUSED",
              pausedAt: new Date(),
            },
          });
        }
      });

      return { message: `Compte suspendu pour ${durationDays} jour(s)` };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        reason: t.Optional(t.String()),
        durationDays: t.Optional(t.Number()),
      }),
    },
  )
  .post(
    "/reactivate/:id",
    async ({ params, status }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          subscriptions: {
            where: { status: "PAUSED" },
            take: 1,
          },
        },
      });

      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      if (!user.banned) {
        return status(400, {
          code: "USER_NOT_SUSPENDED",
          message: "Cet utilisateur n'est pas suspendu",
        });
      }

      const pausedSubscription = user.subscriptions[0];

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: params.id },
          data: {
            banned: false,
            banReason: null,
            banExpires: null,
          },
        });

        if (pausedSubscription?.pausedAt) {
          const pausedMs = Date.now() - pausedSubscription.pausedAt.getTime();

          await tx.subscription.update({
            where: { id: pausedSubscription.id },
            data: {
              status: "ACTIVE",
              pausedAt: null,
              endDate: new Date(
                pausedSubscription.endDate.getTime() + pausedMs,
              ),
            },
          });
        }
      });

      return { message: "Compte réactivé" };
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/ban/:id",
    async ({ params, body, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      await prisma.user.update({
        where: { id: params.id },
        data: {
          banned: true,
          banReason: body.reason ?? "Bannissement administratif",
          banExpires: null, // null = permanent
        },
      });

      return { message: "Compte banni définitivement" };
    },
    {
      params: idSchema,
      body: t.Object({ reason: t.Optional(t.String()) }),
    },
  )
  .post(
    "/unban/:id",
    async ({ params, status }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          subscriptions: {
            where: { status: "PAUSED" },
            take: 1,
          },
        },
      });

      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const pausedSubscription = user.subscriptions[0];

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: params.id },
          data: {
            banned: false,
            banReason: null,
            banExpires: null,
          },
        });

        if (pausedSubscription?.pausedAt) {
          const pausedMs = Date.now() - pausedSubscription.pausedAt.getTime();

          await tx.subscription.update({
            where: { id: pausedSubscription.id },
            data: {
              status: "ACTIVE",
              pausedAt: null,
              endDate: new Date(
                pausedSubscription.endDate.getTime() + pausedMs,
              ),
            },
          });
        }
      });

      return { message: "Compte réactivé" };
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/send-reset-password/:id",
    async ({ params, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      await auth.api.requestPasswordReset({
        body: {
          email: user.email,
          redirectTo: `${env.decorator.env.CLIENT_URL}/reset-password`,
        },
        headers: new Headers(),
      });

      return {
        message: `Lien de réinitialisation envoyé à ${user.email}`,
      };
    },
    { params: idSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      const user = await prisma.user.findUnique({ where: { id: params.id } });
      if (!user) {
        return status(404, {
          code: "USER_NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }
      await prisma.user.delete({ where: { id: params.id } });

      return { message: "Compte supprimé définitivement" };
    },
    { params: idSchema },
  );
