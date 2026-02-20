import type { User } from "firebase/auth";
import type { UserAuthentication } from "@/interfaces/user-authentication";
import { create } from "zustand";
import { loginAction } from "../actions/login.action";
import { useMenusStore } from "./menus.store";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const DEFAULT_TOKEN_TTL_SEC = 3600;
const REFRESH_MARGIN_SEC = 60;

type AuthStatus = "authenticated" | "unauthenticated" | "checking";

type AuthStore = {
  firebaseUser: User | null;
  user: UserAuthentication | null;
  token: string | null;
  status: AuthStatus;
  loginWithIdToken: (idToken: string) => Promise<boolean>;
  setAuthFromBackend: (user: UserAuthentication, accessToken: string) => void;
  logout: () => Promise<void>;
  setUnauthenticated: () => void;
  setFirebaseUser: (user: User | null) => void;
  refreshBackendToken: () => Promise<string | null>;
};

export const useAuthStore = create<AuthStore>()((set, get) => {
  // Scoped to the store instance — no module-level leak across reinitialisations
  let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function clearRefreshTimeout() {
    if (refreshTimeoutId !== null) {
      clearTimeout(refreshTimeoutId);
      refreshTimeoutId = null;
    }
  }

  function scheduleBackendTokenRefresh(
    expiresInSec: number = DEFAULT_TOKEN_TTL_SEC,
  ) {
    clearRefreshTimeout();
    const delayMs = Math.max(1000, (expiresInSec - REFRESH_MARGIN_SEC) * 1000);
    refreshTimeoutId = setTimeout(() => {
      refreshTimeoutId = null;
      void get().refreshBackendToken();
    }, delayMs);
  }

  return {
    firebaseUser: null,
    user: null,
    token: null,
    status: "checking",

    loginWithIdToken: async (idToken: string) => {
      try {
        set({ status: "checking" });
        const authResponse = await loginAction({ idToken });
        const expiresIn = authResponse.expiresIn ?? DEFAULT_TOKEN_TTL_SEC;
        set({
          user: authResponse.user,
          token: authResponse.accessToken,
          status: "authenticated",
        });
        scheduleBackendTokenRefresh(expiresIn);
        return true;
      } catch (error) {
        console.error("[AuthStore] loginWithIdToken failed:", error);
        set({ status: "unauthenticated", user: null, token: null });
        return false;
      }
    },

    setAuthFromBackend: (user: UserAuthentication, accessToken: string) => {
      set({ user, token: accessToken, status: "authenticated" });
    },

    setUnauthenticated: () => {
      clearRefreshTimeout();
      set({
        user: null,
        token: null,
        firebaseUser: null,
        status: "unauthenticated",
      });
    },

    setFirebaseUser: (user: User | null) => {
      set({ firebaseUser: user });
    },

    refreshBackendToken: async () => {
      const { firebaseUser } = get();
      if (!firebaseUser) return null;
      try {
        const idToken = await firebaseUser.getIdToken(true);
        const authResponse = await loginAction({ idToken });
        const expiresIn = authResponse.expiresIn ?? DEFAULT_TOKEN_TTL_SEC;
        set({
          user: authResponse.user,
          token: authResponse.accessToken,
          status: "authenticated",
        });
        scheduleBackendTokenRefresh(expiresIn);
        return authResponse.accessToken;
      } catch (error) {
        console.error("[AuthStore] refreshBackendToken failed:", error);
        set({ status: "unauthenticated", user: null, token: null });
        return null;
      }
    },

    logout: async () => {
      clearRefreshTimeout();
      try {
        await signOut(auth);
      } catch (err) {
        console.error("[AuthStore] Firebase signOut error:", err);
      } finally {
        useMenusStore.getState().reset();
        set({
          user: null,
          token: null,
          firebaseUser: null,
          status: "unauthenticated",
        });
      }
    },
  };
});
