import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";

export const currencyRoutes = new Elysia({ prefix: "/currencies" })
  .get("/", async () => {
    return prisma.currency.findMany({
      include: { _count: { select: { countries: true } } },
      orderBy: { name: "asc" },
    });
  })

  .get(
    "/:id",
    async ({ params, status }) => {
      const currency = await prisma.currency.findUnique({
        where: { id: params.id },
        include: { _count: { select: { countries: true } } },
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
      if (exists)
        return status(409, { message: "Ce code de devise existe déjà" });

      return prisma.currency.create({ data: body });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        code: t.String({ minLength: 3, maxLength: 3 }),
        symbol: t.String(),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      const currency = await prisma.currency.findUnique({
        where: { id: params.id },
      });
      if (!currency) return status(404, { message: "Devise introuvable" });

      if (body.code) {
        const exists = await prisma.currency.findFirst({
          where: { code: body.code, id: { not: params.id } },
        });
        if (exists)
          return status(409, { message: "Ce code de devise existe déjà" });
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
    async ({ params, status }) => {
      const inUse = await prisma.country.count({
        where: { currencyId: params.id },
      });
      if (inUse > 0)
        return status(409, {
          message: `${inUse} pays utilisent encore cette devise`,
        });

      await prisma.currency.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
