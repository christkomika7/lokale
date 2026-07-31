import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { paginate } from "@lokale/lib/pagination";
import { CityType } from "../../generated/prisma/enums";

const SORTABLE_FIELDS = ["name", "region", "population", "type"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export const cityRoutes = new Elysia({ prefix: "/cities" })
  .get(
    "/",
    async ({ query }) => {
      const { page, perPage, search, sortBy, sortOrder, countryId, type } =
        query;

      const orderField = sortBy && isSortable(sortBy) ? sortBy : "name";

      return paginate(prisma.city, {
        page,
        perPage,
        search,
        searchFields: ["name", "region"],
        where: {
          ...(countryId ? { countryId } : {}),
          ...(type ? { type: type as CityType } : {}),
        },
        orderBy: { [orderField]: sortOrder ?? "asc" },
        include: {
          country: { select: { id: true, name: true, code: true } },
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
        countryId: t.Optional(t.String()),
        type: t.Optional(t.String()),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params, status }) => {
      const city = await prisma.city.findUnique({
        where: { id: params.id },
        include: { country: { select: { id: true, name: true, code: true } } },
      });
      if (!city) return status(404, { message: "Ville introuvable" });
      return city;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    "/",
    async ({ body, status }) => {
      const country = await prisma.country.findUnique({
        where: { id: body.countryId },
      });
      if (!country) return status(400, { message: "Pays invalide" });

      return prisma.city.create({
        data: {
          name: body.name,
          population: body.population,
          region: body.region || "",
          type: body.type as CityType,
          countryId: body.countryId as string,
        },
        include: { country: { select: { id: true, name: true, code: true } } },
      });
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        region: t.Optional(t.String()),
        type: t.String(),
        population: t.Optional(t.Number()),
        countryId: t.String({ minLength: 1 }),
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, status }) => {
      const city = await prisma.city.findUnique({ where: { id: params.id } });
      if (!city) return status(404, { message: "Ville introuvable" });

      if (body.countryId) {
        const country = await prisma.country.findUnique({
          where: { id: body.countryId },
        });
        if (!country) return status(400, { message: "Pays invalide" });
      }

      return prisma.city.update({
        where: { id: params.id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.population && { population: body.population }),
          ...(body.region && { region: body.region }),
          ...(body.type && { type: body.type as CityType }),
          ...(body.countryId && { countryId: body.countryId as string }),
        },
        include: { country: { select: { id: true, name: true, code: true } } },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        region: t.Optional(t.String()),
        type: t.Optional(t.String()),
        population: t.Optional(t.Number()),
        countryId: t.Optional(t.String()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params }) => {
      await prisma.city.delete({ where: { id: params.id } });
      return { id: params.id };
    },
    { params: t.Object({ id: t.String() }) },
  );
