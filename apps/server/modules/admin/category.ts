import { Elysia } from "elysia";
import {
  categoryBody,
  categoryPatchBody,
  subCategoryBody,
  subCategoryPatchBody,
} from "@lokale/lib/validator/category";
import { prisma } from "../../lib/prisma";

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .get("/", async () => {
    return prisma.category.findMany({
      include: { subCategories: true },
      orderBy: { name: "asc" },
    });
  })

  .get("/:id", async ({ params, set }) => {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { subCategories: true },
    });
    if (!category) {
      set.status = 404;
      return { error: "Catégorie introuvable" };
    }
    return category;
  })

  .post(
    "/",
    async ({ body, set }) => {
      const exists = await prisma.category.findFirst({
        where: { slug: body.slug },
      });
      if (exists) {
        set.status = 409;
        return { error: "Ce slug est déjà utilisé" };
      }
      return prisma.category.create({
        data: body,
        include: { subCategories: true },
      });
    },
    { body: categoryBody },
  )

  .patch(
    "/:id",
    async ({ params, body, set }) => {
      if (body.slug) {
        const exists = await prisma.category.findFirst({
          where: { slug: body.slug, NOT: { id: params.id } },
        });
        if (exists) {
          set.status = 409;
          return { error: "Ce slug est déjà utilisé" };
        }
      }
      return prisma.category.update({
        where: { id: params.id },
        data: body,
        include: { subCategories: true },
      });
    },
    { body: categoryPatchBody },
  )

  .delete("/:id", async ({ params }) => {
    await prisma.category.delete({ where: { id: params.id } });
    return { id: params.id };
  })

  .post(
    "/:id/sub-categories",
    async ({ params, body }) => {
      return prisma.subCategory.create({
        data: { ...body, categoryID: params.id },
      });
    },
    { body: subCategoryBody },
  )

  .patch(
    "/:id/sub-categories/:subCategoryId",
    async ({ params, body }) => {
      return prisma.subCategory.update({
        where: { id: params.subCategoryId },
        data: body,
      });
    },
    { body: subCategoryPatchBody },
  )

  .delete("/:id/sub-categories/:subCategoryId", async ({ params }) => {
    await prisma.subCategory.delete({ where: { id: params.subCategoryId } });
    return { id: params.subCategoryId };
  });
