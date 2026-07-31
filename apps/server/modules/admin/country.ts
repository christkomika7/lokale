import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";
import { isSortable } from "../../lib/helpers";

export const countryRoutes = new Elysia({ prefix: "/countries" })
  .get(
    "/",
    async ({ query }) => {
      const {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        continent,
        currencyId,
      } = query;

      const orderField = sortBy && isSortable(sortBy) ? sortBy : "name";

      return await paginate(prisma.country, {
        page,
        perPage,
        search,
        searchFields: ["name", "code"],
        where: {
          ...(continent ? { continent } : {}),
          ...(currencyId ? { currencyId } : {}),
        },
        orderBy: { [orderField]: sortOrder ?? "asc" },
        include: {
          currency: true,
          cities: { orderBy: { name: "asc" } },
          _count: { select: { cities: true } },
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
        continent: t.Optional(t.String()),
        currencyId: t.Optional(t.String()),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const country = await prisma.country.findUnique({
        where: { id: params.id },
        include: { currency: true, cities: { orderBy: { name: "asc" } } },
      });
      if (!country) return status(404, { message: "Pays introuvable" });
      return country;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const [codeExists, currency] = await Promise.all([
        prisma.country.findFirst({ where: { code: body.code } }),
        prisma.currency.findUnique({ where: { id: body.currencyId } }),
      ]);
      if (codeExists)
        return status(409, { message: "Ce code pays existe déjà" });
      if (!currency) return status(400, { message: "Devise invalide" });

      return prisma.country.create({
        data: body,
        include: { currency: true, cities: true },
      });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        code: t.String({ minLength: 2, maxLength: 2 }),
        phoneCode: t.String(),
        continent: t.String(),
        currencyId: t.String({ minLength: 1 }),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      const country = await prisma.country.findUnique({
        where: { id: params.id },
      });
      if (!country) return status(404, { message: "Pays introuvable" });

      if (body.code) {
        const exists = await prisma.country.findFirst({
          where: { code: body.code, id: { not: params.id } },
        });
        if (exists) return status(409, { message: "Ce code pays existe déjà" });
      }

      if (body.currencyId) {
        const currency = await prisma.currency.findUnique({
          where: { id: body.currencyId },
        });
        if (!currency) return status(400, { message: "Devise invalide" });
      }

      return prisma.country.update({
        where: { id: params.id },
        data: body,
        include: { currency: true, cities: true },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        code: t.Optional(t.String({ minLength: 2, maxLength: 2 })),
        phoneCode: t.Optional(t.String()),
        continent: t.Optional(t.String()),
        currencyId: t.Optional(t.String({ minLength: 1 })),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      const cityCount = await prisma.city.count({
        where: { countryId: params.id },
      });
      if (cityCount > 0) {
        await prisma.city.deleteMany({ where: { countryId: params.id } });
      }
      await prisma.country.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
