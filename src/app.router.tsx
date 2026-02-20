import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { PageSuspense } from "@/components/PageSuspense";
import {
  AuthenticatedRoute,
  MenuProtectedRoute,
  NotAuthenticatedRoute,
} from "./components/routes/ProtectedRoutes";

const AuthLayout = lazy(() =>
  import("./auth/layouts/AuthLayout").then((m) => ({ default: m.AuthLayout })),
);
const LoginPage = lazy(() =>
  import("./auth/pages/login/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("./auth/pages/register/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);

const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));
const DashboardPage = lazy(() =>
  import("./admin/pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const PlaceholderPage = lazy(() =>
  import("./admin/pages/PlaceholderPage").then((m) => ({
    default: m.PlaceholderPage,
  })),
);
const ProductFormPage = lazy(() =>
  import("./admin/pages/product-form/ProductFormPage").then((m) => ({
    default: m.ProductFormPage,
  })),
);
const ProductsPage = lazy(() =>
  import("./admin/pages/products/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./admin/pages/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import("./admin/pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const BundlesPage = lazy(() =>
  import("./admin/pages/bundles/BundlesPage").then((m) => ({
    default: m.BundlesPage,
  })),
);
const SlabsPage = lazy(() =>
  import("./admin/pages/slabs/SlabsPage").then((m) => ({
    default: m.SlabsPage,
  })),
);


export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthenticatedRoute>
        <MenuProtectedRoute>
          <PageSuspense>
            <AdminLayout />
          </PageSuspense>
        </MenuProtectedRoute>
      </AuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PageSuspense>
            <DashboardPage />
          </PageSuspense>
        ),
      },
      {
        path: "products",
        element: (
          <PageSuspense>
            <ProductsPage />
          </PageSuspense>
        ),
      },
      {
        path: "products/:id",
        element: (
          <PageSuspense>
            <ProductFormPage />
          </PageSuspense>
        ),
      },
      {
        path: "profile",
        element: (
          <PageSuspense>
            <ProfilePage />
          </PageSuspense>
        ),
      },
      {
        path: "settings",
        element: (
          <PageSuspense>
            <SettingsPage />
          </PageSuspense>
        ),
      },
      {
        path: "bundles",
        element: (
          <PageSuspense>
            <BundlesPage />
          </PageSuspense>
        ),
      },
      {
        path: "slabs",
        element: (
          <PageSuspense>
            <SlabsPage />
          </PageSuspense>
        ),
      },
      // Catch-all for menu paths from the backend that don't have a route yet
      // (e.g. /inventory/products, /users). Prevents redirect loop with MenuProtectedRoute.
      {
        path: "*",
        element: (
          <PageSuspense>
            <PlaceholderPage />
          </PageSuspense>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <NotAuthenticatedRoute>
        <PageSuspense>
          <AuthLayout />
        </PageSuspense>
      </NotAuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" />,
      },
      {
        path: "login",
        element: (
          <PageSuspense>
            <LoginPage />
          </PageSuspense>
        ),
      },
      {
        path: "register",
        element: (
          <PageSuspense>
            <RegisterPage />
          </PageSuspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
