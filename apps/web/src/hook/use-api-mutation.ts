import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "#/lib/api-client";

type Method = "get" | "post" | "put" | "patch" | "delete";

interface UseApiMutationOptions<TResponse, TVariables> extends Omit<
  UseMutationOptions<TResponse, ApiError, TVariables>,
  "mutationFn"
> {
  method?: Method;
  invalidate?: string[];
  successMessage?: string | ((data: TResponse) => string);
}

export function useApiMutation<TResponse, TVariables = unknown>(
  path: string | ((variables: TVariables) => string),
  options?: UseApiMutationOptions<TResponse, TVariables>,
) {
  const queryClient = useQueryClient();
  const {
    method = "post",
    invalidate,
    successMessage,
    onSuccess,
    onError,
    ...rest
  } = options ?? {};

  return useMutation<TResponse, ApiError, TVariables>({
    mutationFn: (variables) => {
      const url = typeof path === "function" ? path(variables) : path;

      if (method === "delete") return api.delete<TResponse>(url);

      if (method === "get") return api.get<TResponse>(url);

      return api[method]<TResponse, TVariables>(url, variables);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      if (successMessage) {
        toast.success(
          typeof successMessage === "function"
            ? successMessage(data)
            : successMessage,
        );
      }
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: invalidate });
      }
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      onError?.(error, variables, onMutateResult, context);
    },
    ...rest,
  });
}
