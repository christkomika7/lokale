import { useApiMutation } from "#/hook/use-api-mutation";
import { useApiQuery } from "#/hook/use-api-query";
import type {
  Category,
  CategorySchemaType,
  SubCategory,
  SubCategorySchemaType,
} from "@lokale/types/category";
import type { PaginatedResult } from "@lokale/types/pagination";

interface GetCategoriesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined | null;
}

interface GetSubCategoriesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryID?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export const categoryApi = {
  // ─── Categories ───────────────────────────────────────────────────────────
  getCategories: (params?: GetCategoriesParams) =>
    useApiQuery<PaginatedResult<Category>>(
      ["categories", params],
      "/admin/categories",
      { params },
    ),

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
        invalidate: ["categories", "sub-categories"],
        successMessage: "Catégorie modifiée",
      },
    ),

  deleteCategory: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/categories/${id}`, {
      method: "delete",
      invalidate: ["categories", "sub-categories"],
      successMessage: "Catégorie supprimée",
    }),

  // ─── SubCategories (standalone) ───────────────────────────────────────────
  getSubCategories: (params?: GetSubCategoriesParams) =>
    useApiQuery<PaginatedResult<SubCategory>>(
      ["sub-categories", params],
      "/admin/sub-categories",
      { params },
    ),

  getSubCategory: (id: string) =>
    useApiQuery<SubCategory>(
      ["sub-categories", id],
      `/admin/sub-categories/${id}`,
    ),

  createSubCategory: () =>
    useApiMutation<SubCategory, SubCategorySchemaType>(
      "/admin/sub-categories",
      {
        method: "post",
        invalidate: ["sub-categories", "categories"],
        successMessage: "Sous-catégorie ajoutée",
      },
    ),

  updateSubCategory: (id: string) =>
    useApiMutation<SubCategory, Partial<SubCategorySchemaType>>(
      `/admin/sub-categories/${id}`,
      {
        method: "patch",
        invalidate: ["sub-categories", "categories"],
        successMessage: "Sous-catégorie modifiée",
      },
    ),

  deleteSubCategory: (id: string) =>
    useApiMutation<{ id: string }, void>(`/admin/sub-categories/${id}`, {
      method: "delete",
      invalidate: ["sub-categories", "categories"],
      successMessage: "Sous-catégorie supprimée",
    }),
};
