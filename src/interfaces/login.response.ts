import type { UserAuthentication } from "./user-authentication";

export interface AuthLoginResponse {
  accessToken: string;
  user: UserAuthentication;
  /** JWT lifetime in seconds (e.g. 3600 = 1 h). If present, frontend will refresh before expiry. */
  expiresIn?: number;
}
