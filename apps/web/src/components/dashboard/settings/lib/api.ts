import { useApiMutation } from "#/hook/use-api-mutation";
import { useApiQuery } from "#/hook/use-api-query";
import type { System, SystemSchemaType } from "@lokale/types/system";

export const api = {
  getSystem: () => useApiQuery<System>(["system"], "/admin/system"),

  updateSystem: () =>
    useApiMutation<System, Partial<SystemSchemaType>>("/admin/system", {
      method: "patch",
      invalidate: ["system"],
      successMessage: "Paramètres système mis à jour",
    }),
};
