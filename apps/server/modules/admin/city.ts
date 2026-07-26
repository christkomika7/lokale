import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";

const CityType = t.Union([
  t.Literal("CAPITAL"),
  t.Literal("METROPOLIS"),
  t.Literal("CITY"),
  t.Literal("TOWN"),
  t.Literal("VILLAGE"),
  t.Literal("HAMLET"),
  t.Literal("SUBURB"),
  t.Literal("INDUSTRIAL_ZONE"),
  t.Literal("COMMERCIAL_ZONE"),
  t.Literal("TOURIST_AREA"),
  t.Literal("PORT_CITY"),
  t.Literal("BORDER_CITY"),
]);

export const cityRoutes = new Elysia({ prefix: "/:countryId/cities" })
  .post(
    "/",
    async ({ params, body, status }) => {
      const country = await prisma.country.findUnique({
        where: { id: params.countryId },
      });
      if (!country) return status(404, { message: "Pays introuvable" });

      return prisma.city.create({
        data: { ...body, countryId: params.countryId },
      });
    },
    {
      params: t.Object({ countryId: t.String() }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        region: t.Optional(t.String()),
        type: CityType,
        population: t.Optional(t.Number({ minimum: 1 })),
      }),
    },
  )

  .patch(
    "/:cityId",
    async ({ params, body, status }) => {
      const city = await prisma.city.findFirst({
        where: { id: params.cityId, countryId: params.countryId },
      });
      if (!city) return status(404, { message: "Ville introuvable" });

      return prisma.city.update({ where: { id: params.cityId }, data: body });
    },
    {
      params: t.Object({ countryId: t.String(), cityId: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        region: t.Optional(t.String()),
        type: t.Optional(CityType),
        population: t.Optional(t.Number({ minimum: 1 })),
      }),
    },
  )

  .delete(
    "/:cityId",
    async ({ params, status }) => {
      const city = await prisma.city.findFirst({
        where: { id: params.cityId, countryId: params.countryId },
      });
      if (!city) return status(404, { message: "Ville introuvable" });

      await prisma.city.delete({ where: { id: params.cityId } });
      return { id: params.cityId };
    },
    { params: t.Object({ countryId: t.String(), cityId: t.String() }) },
  );
