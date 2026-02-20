import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { Toaster } from "sonner";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { CustomFullScreenLoading } from "./components/ui/custom/CustomFullScreenLoading";
import { useAuthStore } from "./auth/store/auth.store";
import { useMenusStore } from "./auth/store/menus.store";
import { auth } from "./lib/firebase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

/**
 * Auth resolution is async (Firebase onAuthStateChanged + backend loginWithIdToken).
 * This component reads auth/menus from the store and only re-renders when that state
 * changes; it does not await anything. Children (router) render once auth + menus are ready.
 */
const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const {
    loginWithIdToken,
    setFirebaseUser,
    setUnauthenticated,
    status,
    token,
  } = useAuthStore();
  const { fetchMenus, status: menusStatus } = useMenusStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        void firebaseUser.getIdToken().then((idToken) => {
          void loginWithIdToken(idToken);
        });
      } else {
        setUnauthenticated();
      }
    });
    return () => unsubscribe();
  }, [loginWithIdToken, setFirebaseUser, setUnauthenticated]);

  useEffect(() => {
    // Only fetch if menus are not already available (e.g. not hydrated from sessionStorage)
    if (status === "authenticated" && (menusStatus === "idle" || menusStatus === "error")) {
      void fetchMenus();
    }
  }, [status, menusStatus, fetchMenus]);

  if (status === "checking") return <CustomFullScreenLoading />;

  if (
    status === "authenticated" &&
    (!token || menusStatus === "loading" || menusStatus === "idle")
  ) {
    return <CustomFullScreenLoading />;
  }

  return children;
};

export const BackOfficeApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <CheckAuthProvider>
        <RouterProvider router={appRouter} />
      </CheckAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
