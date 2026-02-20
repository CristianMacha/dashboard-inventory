import { apiClient } from "@/api/apiClient";
import type { FirebaseLoginBody } from "@/interfaces/auth-login";
import type { AuthLoginResponse } from "@/interfaces/login.response";

/**
 * Exchanges a Firebase ID token for a backend JWT and user data.
 * Backend validates the idToken and returns its own JWT + user (roles, permissions).
 */
export const loginAction = async (
  body: FirebaseLoginBody,
): Promise<AuthLoginResponse> => {
  const { data } = await apiClient.post<AuthLoginResponse>("/auth/login", body);
  return data;
};
