import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuthStore } from "@/auth/store/auth.store";
import {
  getAllowedPaths,
  isPathAllowed,
  useMenusStore,
} from "@/auth/store/menus.store";
import { MenusErrorScreen } from "./MenusErrorScreen";
import { CustomFullScreenLoading } from "../ui/custom/CustomFullScreenLoading";

export const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { status, token } = useAuthStore();

  if (status === "checking" || (status === "authenticated" && !token)) {
    return <CustomFullScreenLoading />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { status } = useAuthStore();

  if (status === "checking") {
    return <CustomFullScreenLoading />;
  }

  if (status === "authenticated") {
    return <Navigate to="/" />;
  }

  return children;
};

/**
 * Protects admin routes using menus from the backend.
 * Only allows access to paths that appear in the user's menu list.
 * When menus fail to load or are empty, shows MenusErrorScreen (retry / logout) instead of allowing access in silence.
 */
export const MenuProtectedRoute = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation();
  const { items, status: menusStatus } = useMenusStore();

  if (menusStatus === "loading" || menusStatus === "idle") {
    return <CustomFullScreenLoading />;
  }

  const allowedPaths = getAllowedPaths(items);

  if (menusStatus === "error") {
    return <MenusErrorScreen variant="error" />;
  }

  if (allowedPaths.length === 0) {
    return <MenusErrorScreen variant="empty" />;
  }

  const allowed = isPathAllowed(pathname, allowedPaths);

  if (!allowed) {
    const firstPath = allowedPaths[0];
    return <Navigate to={firstPath} replace />;
  }

  return children;
};
