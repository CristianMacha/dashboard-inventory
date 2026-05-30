import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { Toaster } from "sonner";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { CustomFullScreenLoading } from "./components/ui/custom/CustomFullScreenLoading";
import { useAuthStore } from "./auth/store/auth.store";
import { useMenusQuery } from "./auth/store/menus.store";
import { menuKeys } from "./admin/queryKeys";
import { auth } from "./lib/firebase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const {
    loginWithIdToken,
    setFirebaseUser,
    setUnauthenticated,
    status,
    token,
  } = useAuthStore();
  const qc = useQueryClient();
  const { isLoading: menusLoading } = useMenusQuery(status === "authenticated");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        void firebaseUser
          .getIdToken()
          .then((idToken) => loginWithIdToken(idToken))
          .catch((err: unknown) => {
            console.error("[Auth] Failed to get Firebase ID token:", err);
            setUnauthenticated();
          });
      } else {
        setUnauthenticated();
      }
    });
    return () => unsubscribe();
  }, [loginWithIdToken, setFirebaseUser, setUnauthenticated]);

  useEffect(() => {
    if (status === "unauthenticated") {
      qc.removeQueries({ queryKey: menuKeys.all });
    }
  }, [status, qc]);

  if (status === "checking") return <CustomFullScreenLoading />;

  if (status === "authenticated" && (!token || menusLoading)) {
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
