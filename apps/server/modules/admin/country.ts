import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";

export const countryRoutes = new Elysia({ prefix: "/countries" })
  .get("/", async () => {
    return prisma.country.findMany({
      include: {
        currency: true,
        cities: { orderBy: { name: "asc" } },
        _count: { select: { cities: true } },
      },
      orderBy: { name: "asc" },
    });
  })

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
    async ({ params, status }) => {
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
