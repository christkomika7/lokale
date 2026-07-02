import { Elysia, t } from "elysia";
import { $Enums, Prisma } from "../../generated/prisma/client";
import { Role, UserStatus, Plan, User } from "@lokale/types/user";
import { PaginatedResponse } from "@lokale/types/response";
import { prisma } from "../../lib/prisma";
import { computeUserStatus, buildStatusWhere } from "../../lib/user-status";
import { auth } from "../../lib/auth";
import { sendOtpEmail, sendWelcomeEmail } from "../../lib/mailer";
import { userSchema } from "@lokale/lib/validator/user";
import { addMonths } from "@lokale/lib/date";

const SORTABLE_FIELDS = {
  name: "name",
  joinedAt: "createdAt",
  activity: "lastSeenAt",
} as const;

type SortableKey = keyof typeof SORTABLE_FIELDS;

export const userRoute = new Elysia({ prefix: "/users" })
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
    async ({ body, status, request }) => {
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
      console.log("Hello");
      if (emailVerified) {
        await sendWelcomeEmail({ address: email, name }, name);
      } else {
        console.log(":: Sending verification email to:", email);
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
  );
