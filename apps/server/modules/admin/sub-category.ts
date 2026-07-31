import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";

const SORTABLE_FIELDS = ["name", "slug"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export const subCategoryRoutes = new Elysia({ prefix: "/sub-categories" })
  .get(
    "/",
    async ({ query }) => {
      const { page, perPage, search, sortBy, sortOrder, categoryID } = query;
      const orderField = sortBy && isSortable(sortBy) ? sortBy : "name";

      return paginate(prisma.subCategory, {
        page,
        perPage,
        search,
        searchFields: ["name", "slug"],
        where: {
          ...(categoryID ? { categoryID } : {}),
        },
        orderBy: { [orderField]: sortOrder ?? "asc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
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
        categoryID: t.Optional(t.String()),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: params.id },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
      if (!subCategory)
        return status(404, { message: "Sous-catégorie introuvable" });
      return subCategory;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryID },
      });
      if (!category) return status(400, { message: "Catégorie invalide" });

      return prisma.subCategory.create({
        data: body,
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        description: t.String(),
        categoryID: t.String({ minLength: 1 }),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      if (body.categoryID) {
        const category = await prisma.category.findUnique({
          where: { id: body.categoryID },
        });
        if (!category) return status(400, { message: "Catégorie invalide" });
      }

      return prisma.subCategory.update({
        where: { id: params.id },
        data: body,
        include: { category: { select: { id: true, name: true, slug: true } } },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        slug: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String()),
        categoryID: t.Optional(t.String()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.subCategory.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
