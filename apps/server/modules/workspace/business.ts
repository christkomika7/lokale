import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";
import { BusinessStatus } from "../../generated/prisma/enums";

const SORTABLE_FIELDS = ["name", "createdAt", "status"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export const businessRoutes = new Elysia({ prefix: "/businesses" })
  .get(
    "/",
    async ({ query }) => {
      const { page, perPage, search, sortBy, sortOrder, status, category } =
        query;
      const orderField = sortBy && isSortable(sortBy) ? sortBy : "createdAt";

      return paginate(prisma.business, {
        page,
        perPage,
        search,
        searchFields: ["name", "city", "sector"],
        where: {
          ...(status ? { status: status as BusinessStatus } : {}),
          ...(category ? { category } : {}),
        },
        orderBy: { [orderField]: sortOrder ?? "desc" },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { publications: true, actions: true } },
        },
      });
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        perPage: t.Optional(t.Numeric()),
        search: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
        status: t.Optional(t.String()),
        category: t.Optional(t.String()),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const business = await prisma.business.findUnique({
        where: { id: params.id },
        include: { owner: { select: { id: true, name: true, email: true } } },
      });
      if (!business) return status(404, { message: "Entreprise introuvable" });
      return business;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const exists = await prisma.business.findUnique({
        where: { slug: body.slug },
      });
      if (exists) return status(409, { message: "Ce slug est déjà utilisé" });

      return prisma.business.create({
        data: body,
        include: { owner: { select: { id: true, name: true, email: true } } },
      });
    },
    {
      body: t.Object({
        ownerId: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
        sector: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        email: t.Optional(t.String()),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      if (body.slug) {
        const exists = await prisma.business.findFirst({
          where: { slug: body.slug, NOT: { id: params.id } },
        });
        if (exists) return status(409, { message: "Ce slug est déjà utilisé" });
      }
      return prisma.business.update({
        where: { id: params.id },
        data: body,
        include: { owner: { select: { id: true, name: true, email: true } } },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        slug: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
        sector: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        email: t.Optional(t.String()),
      }),
    },
  )

  // ─── Statut : activer / suspendre ───────────────────────────────────────────
  .patch(
    "/:id/status",
    async ({ params, body }) => {
      return prisma.business.update({
        where: { id: params.id },
        data: {
          status: body.status,
          verified: body.status === "ACTIVE" ? true : undefined,
          verifiedAt: body.status === "ACTIVE" ? new Date() : undefined,
        },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([
          t.Literal("PENDING"),
          t.Literal("ACTIVE"),
          t.Literal("SUSPENDED"),
          t.Literal("CLOSED"),
        ]),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.business.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
