import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/store/auth.store";
import axios from "axios";
import { env } from "@/lib/env";

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Extracts a user-friendly error message from any thrown value.
 * ApiError messages come from the backend and are safe to show directly.
 * All other errors fall back to the provided fallback string.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue of callbacks waiting for a token refresh to complete
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolvePendingQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;
    if (!originalRequest) {
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // For non-401 errors with a response, wrap in ApiError to preserve details
    if (error.response && error.response.status !== 401) {
      const responseData = error.response.data as Record<string, unknown> | undefined;
      const message =
        (typeof responseData?.message === "string" ? responseData.message : null) ??
        error.message;
      return Promise.reject(new ApiError(message, error.response.status, error.response.data));
    }

    const is401 =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login");

    if (is401) {
      if (isRefreshing) {
        // Another refresh is already in-flight — wait for it to resolve
        return new Promise<AxiosResponse>((resolve, reject) => {
          pendingQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(new Error("Session expired"));
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshBackendToken();
        resolvePendingQueue(newToken);

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return await apiClient(originalRequest);
        }

        void useAuthStore.getState().logout();
      } catch (refreshError) {
        resolvePendingQueue(null);
        void useAuthStore.getState().logout();
        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error(String(refreshError)),
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export { apiClient };

