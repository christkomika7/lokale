import { z } from "zod";

export const categoryBody = z.object({
  name: z
    .string({ error: "Veuillez saisir un nom" })
    .min(1, "Veuillez saisir un nom")
    .trim(),
  slug: z
    .string({ error: "Veuillez saisir un slug" })
    .min(1, "Veuillez saisir un slug")
    .trim(),
  description: z
    .string({ error: "Veuillez saisir une description" })
    .min(1, "Veuillez saisir une description")
    .trim(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const categoryPatchBody = categoryBody.partial();

export const subCategoryBody = z.object({
  name: z
    .string({ error: "Veuillez saisir un nom" })
    .min(1, "Veuillez saisir un nom")
    .trim(),
  slug: z
    .string({ error: "Veuillez saisir un slug" })
    .min(1, "Veuillez saisir un slug")
    .trim(),
  description: z
    .string({ error: "Veuillez saisir une description" })
    .min(1, "Veuillez saisir une description")
    .trim(),
});

export const subCategoryPatchBody = subCategoryBody.partial();
