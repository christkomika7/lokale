import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";
import { currencySchema } from "@lokale/lib/validator/localisation";

const SORTABLE_FIELDS = ["name", "code"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export const currencyRoutes = new Elysia({ prefix: "/currencies" })
  .get(
    "/",
    async ({ query }) => {
      const { page, perPage, search, sortBy, sortOrder } = query;
      const orderField = sortBy && isSortable(sortBy) ? sortBy : "name";

      return paginate(prisma.currency, {
        page,
        perPage,
        search,
        searchFields: ["name", "code"],
        orderBy: { [orderField]: sortOrder ?? "asc" },
        include: { _count: { select: { countries: true } } },
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
      const currency = await prisma.currency.findUnique({
        where: { id: params.id },
      });
      if (!currency) return status(404, { message: "Devise introuvable" });
      return currency;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const exists = await prisma.currency.findFirst({
        where: { code: body.code },
      });
      if (exists) return status(409, { message: "Ce code devise existe déjà" });
      return prisma.currency.create({
        data: {
          name: body.name,
          code: body.code,
          symbol: body.symbol,
        },
      });
    },
    {
      body: currencySchema,
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      if (body.code) {
        const exists = await prisma.currency.findFirst({
          where: { code: body.code, id: { not: params.id } },
        });
        if (exists)
          return status(409, { message: "Ce code devise existe déjà" });
      }
      return prisma.currency.update({ where: { id: params.id }, data: body });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        code: t.Optional(t.String({ minLength: 3, maxLength: 3 })),
        symbol: t.Optional(t.String()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.currency.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
