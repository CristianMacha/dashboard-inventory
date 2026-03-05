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
const ProductDetailPage = lazy(() =>
  import("./admin/pages/products/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
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
const BundleDetailPage = lazy(() =>
  import("./admin/pages/bundles/BundleDetailPage").then((m) => ({
    default: m.BundleDetailPage,
  })),
);
const SlabsPage = lazy(() =>
  import("./admin/pages/slabs/SlabsPage").then((m) => ({
    default: m.SlabsPage,
  })),
);
const CategoriesPage = lazy(() =>
  import("./admin/pages/categories/CategoriesPage").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const BrandsPage = lazy(() =>
  import("./admin/pages/brands/BrandsPage").then((m) => ({
    default: m.BrandsPage,
  })),
);
const LevelsPage = lazy(() =>
  import("./admin/pages/levels/LevelsPage").then((m) => ({
    default: m.LevelsPage,
  })),
);
const FinishesPage = lazy(() =>
  import("./admin/pages/finishes/FinishesPage").then((m) => ({
    default: m.FinishesPage,
  })),
);
const SuppliersPage = lazy(() =>
  import("./admin/pages/suppliers/SuppliersPage").then((m) => ({
    default: m.SuppliersPage,
  })),
);
const PurchaseInvoicesPage = lazy(() =>
  import("./admin/pages/purchase-invoices/PurchaseInvoicesPage").then((m) => ({
    default: m.PurchaseInvoicesPage,
  })),
);
const PurchaseInvoiceDetailPage = lazy(() =>
  import("./admin/pages/purchase-invoices/PurchaseInvoiceDetailPage").then(
    (m) => ({ default: m.PurchaseInvoiceDetailPage }),
  ),
);
const JobsPage = lazy(() =>
  import("./admin/pages/jobs/JobsPage").then((m) => ({
    default: m.JobsPage,
  })),
);
const JobDetailPage = lazy(() =>
  import("./admin/pages/jobs/JobDetailPage").then((m) => ({
    default: m.JobDetailPage,
  })),
);
const SupplierReturnsPage = lazy(() =>
  import("./admin/pages/supplier-returns/SupplierReturnsPage").then((m) => ({
    default: m.SupplierReturnsPage,
  })),
);
const SupplierReturnDetailPage = lazy(() =>
  import("./admin/pages/supplier-returns/SupplierReturnDetailPage").then(
    (m) => ({ default: m.SupplierReturnDetailPage }),
  ),
);
const JobPaymentsPage = lazy(() =>
  import("./admin/pages/job-payments/JobPaymentsPage").then((m) => ({
    default: m.JobPaymentsPage,
  })),
);
const InvoicePaymentsPage = lazy(() =>
  import("./admin/pages/invoice-payments/InvoicePaymentsPage").then((m) => ({
    default: m.InvoicePaymentsPage,
  })),
);
const GeneralPaymentsPage = lazy(() =>
  import("./admin/pages/general-payments/GeneralPaymentsPage").then((m) => ({
    default: m.GeneralPaymentsPage,
  })),
);
const CashflowPage = lazy(() =>
  import("./admin/pages/accounting/CashflowPage").then((m) => ({
    default: m.CashflowPage,
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
        path: "products/:id/detail",
        element: (
          <PageSuspense>
            <ProductDetailPage />
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
        path: "bundles/:id",
        element: (
          <PageSuspense>
            <BundleDetailPage />
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
      {
        path: "categories",
        element: (
          <PageSuspense>
            <CategoriesPage />
          </PageSuspense>
        ),
      },
      {
        path: "brands",
        element: (
          <PageSuspense>
            <BrandsPage />
          </PageSuspense>
        ),
      },
      {
        path: "finishes",
        element: (
          <PageSuspense>
            <FinishesPage />
          </PageSuspense>
        ),
      },
      {
        path: "levels",
        element: (
          <PageSuspense>
            <LevelsPage />
          </PageSuspense>
        ),
      },
      {
        path: "suppliers",
        element: (
          <PageSuspense>
            <SuppliersPage />
          </PageSuspense>
        ),
      },
      {
        path: "purchase-invoices",
        element: (
          <PageSuspense>
            <PurchaseInvoicesPage />
          </PageSuspense>
        ),
      },
      {
        path: "purchase-invoices/:id",
        element: (
          <PageSuspense>
            <PurchaseInvoiceDetailPage />
          </PageSuspense>
        ),
      },
      {
        path: "jobs",
        element: (
          <PageSuspense>
            <JobsPage />
          </PageSuspense>
        ),
      },
      {
        path: "jobs/:id",
        element: (
          <PageSuspense>
            <JobDetailPage />
          </PageSuspense>
        ),
      },
      {
        path: "purchasing/supplier-returns",
        element: (
          <PageSuspense>
            <SupplierReturnsPage />
          </PageSuspense>
        ),
      },
      {
        path: "purchasing/supplier-returns/:id",
        element: (
          <PageSuspense>
            <SupplierReturnDetailPage />
          </PageSuspense>
        ),
      },
      {
        path: "job-payments",
        element: (
          <PageSuspense>
            <JobPaymentsPage />
          </PageSuspense>
        ),
      },
      {
        path: "invoice-payments",
        element: (
          <PageSuspense>
            <InvoicePaymentsPage />
          </PageSuspense>
        ),
      },
      {
        path: "general-payments",
        element: (
          <PageSuspense>
            <GeneralPaymentsPage />
          </PageSuspense>
        ),
      },
      {
        path: "accounting/cashflow",
        element: (
          <PageSuspense>
            <CashflowPage />
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
