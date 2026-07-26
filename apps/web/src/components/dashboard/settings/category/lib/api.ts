import { useApiMutation } from "#/hook/use-api-mutation";
import { useApiQuery } from "#/hook/use-api-query";
import type {
  Category,
  CategorySchemaType,
  SubCategory,
  SubCategorySchemaType,
} from "@lokale/types/category";

export const categoryApi = {
  getCategories: () =>
    useApiQuery<Category[]>(["categories"], "/admin/categories"),

  getCategory: (id: string) =>
    useApiQuery<Category>(["categories", id], `/admin/categories/${id}`),

  createCategory: () =>
    useApiMutation<Category, CategorySchemaType>("/admin/categories", {
      method: "post",
      invalidate: ["categories"],
      successMessage: "Catégorie ajoutée",
    }),

  updateCategory: (id: string) =>
    useApiMutation<Category, Partial<CategorySchemaType>>(
      `/admin/categories/${id}`,
      {
        method: "patch",
        invalidate: ["categories"],
        successMessage: "Catégorie modifiée",
      },
    ),

  deleteCategory: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/categories/${id}`, {
      method: "delete",
      invalidate: ["categories"],
      successMessage: "Catégorie supprimée",
    }),

  createSubCategory: (categoryId: string) =>
    useApiMutation<SubCategory, SubCategorySchemaType>(
      `/admin/categories/${categoryId}/sub-categories`,
      {
        method: "post",
        invalidate: ["categories"],
        successMessage: "Sous-catégorie ajoutée",
      },
    ),

  updateSubCategory: (categoryId: string, subCategoryId: string) =>
    useApiMutation<SubCategory, Partial<SubCategorySchemaType>>(
      `/admin/categories/${categoryId}/sub-categories/${subCategoryId}`,
      {
        method: "patch",
        invalidate: ["categories"],
        successMessage: "Sous-catégorie modifiée",
      },
    ),

  deleteSubCategory: (categoryId: string, subCategoryId: string) =>
    useApiMutation<{ id: string }, void>(
      `/admin/categories/${categoryId}/sub-categories/${subCategoryId}`,
      {
        method: "delete",
        invalidate: ["categories"],
        successMessage: "Sous-catégorie supprimée",
      },
    ),
};
