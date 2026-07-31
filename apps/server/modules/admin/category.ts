import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";

const SORTABLE_FIELDS = ["name", "slug"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .get(
    "/",
    async ({ query }) => {
      const { page, perPage, search, sortBy, sortOrder } = query;
      const orderField = sortBy && isSortable(sortBy) ? sortBy : "name";

      return paginate(prisma.category, {
        page,
        perPage,
        search,
        searchFields: ["name", "slug"],
        orderBy: { [orderField]: sortOrder ?? "asc" },
        include: {
          subCategories: true,
          _count: { select: { subCategories: true } },
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
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const category = await prisma.category.findUnique({
        where: { id: params.id },
        include: { subCategories: true },
      });
      if (!category) return status(404, { message: "Catégorie introuvable" });
      return category;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const exists = await prisma.category.findFirst({
        where: { slug: body.slug },
      });
      if (exists) return status(409, { message: "Ce slug est déjà utilisé" });

      return prisma.category.create({
        data: body,
        include: { subCategories: true },
      });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        description: t.String(),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      if (body.slug) {
        const exists = await prisma.category.findFirst({
          where: { slug: body.slug, NOT: { id: params.id } },
        });
        if (exists) return status(409, { message: "Ce slug est déjà utilisé" });
      }
      return prisma.category.update({
        where: { id: params.id },
        data: body,
        include: { subCategories: true },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        slug: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.category.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
