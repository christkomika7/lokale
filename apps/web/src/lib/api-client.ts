import { env } from "./env";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: RequestOptions["params"],
) {
  const url = new URL(path, baseUrl || window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function createApiClient(baseUrl: string) {
  async function request<TResponse>(
    path: string,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    const { body, params, headers, ...rest } = options;

    const res = await fetch(buildUrl(baseUrl, path, params), {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      throw new ApiError(
        data?.message ?? res.statusText,
        res.status,
        data?.code,
        data,
      );
    }

    return data as TResponse;
  }

  return {
    get: <TResponse>(
      path: string,
      options?: Omit<RequestOptions, "body" | "method">,
    ) => request<TResponse>(path, { ...options, method: "GET" }),
    post: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: Omit<RequestOptions, "body" | "method">,
    ) => request<TResponse>(path, { ...options, method: "POST", body }),
    put: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: Omit<RequestOptions, "body" | "method">,
    ) => request<TResponse>(path, { ...options, method: "PUT", body }),
    patch: <TResponse, TBody = unknown>(
      path: string,
      body?: TBody,
      options?: Omit<RequestOptions, "body" | "method">,
    ) => request<TResponse>(path, { ...options, method: "PATCH", body }),
    delete: <TResponse>(
      path: string,
      options?: Omit<RequestOptions, "body" | "method">,
    ) => request<TResponse>(path, { ...options, method: "DELETE" }),
  };
}

export const api = createApiClient(env.VITE_SERVER_HOST!);
