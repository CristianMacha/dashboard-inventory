import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/store/auth.store";
import axios from "axios";

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
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

    const is401 =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login");

    if (is401) {
      if (isRefreshing) {
        // Another refresh is already in-flight — wait for it to resolve
        return new Promise<unknown>((resolve, reject) => {
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
