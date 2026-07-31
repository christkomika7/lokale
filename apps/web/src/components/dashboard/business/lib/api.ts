import { useApiMutation } from "#/hook/use-api-mutation";
import { useApiQuery } from "#/hook/use-api-query";
import type {
  Business,
  BusinessSchemaType,
  BusinessStatus,
} from "@lokale/types/business";
import type { PaginatedResult } from "@lokale/types/pagination";

interface GetBusinessesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: BusinessStatus;
  category?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export const businessApi = {
  getBusinesses: (params?: GetBusinessesParams) =>
    useApiQuery<PaginatedResult<Business>>(
      ["businesses", params],
      "/workspace/businesses",
      { params },
    ),

  getBusiness: (id: string) =>
    useApiQuery<Business>(["businesses", id], `/workspace/businesses/${id}`),

  createBusiness: () =>
    useApiMutation<Business, BusinessSchemaType>("/workspace/businesses", {
      method: "post",
      invalidate: ["businesses"],
      successMessage: "Entreprise ajoutée",
    }),

  updateBusiness: (id: string) =>
    useApiMutation<Business, Partial<BusinessSchemaType>>(
      `/workspace/businesses/${id}`,
      {
        method: "patch",
        invalidate: ["businesses"],
        successMessage: "Entreprise modifiée",
      },
    ),

  updateBusinessStatus: (id: string) =>
    useApiMutation<Business, { status: BusinessStatus }>(
      `/workspace/businesses/${id}/status`,
      {
        method: "patch",
        invalidate: ["businesses"],
        successMessage: "Statut mis à jour",
      },
    ),

  deleteBusiness: (id: string) =>
    useApiMutation<{ id: string }, void>(`/workspace/businesses/${id}`, {
      method: "delete",
      invalidate: ["businesses"],
      successMessage: "Entreprise supprimée",
    }),
};
