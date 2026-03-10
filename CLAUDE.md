# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Vite)
pnpm build        # Type-check + production build
pnpm lint         # ESLint
pnpm preview      # Preview production build
```

No test runner is configured.

## Environment

Copy `.env.sample` to `.env` and set `VITE_API_URL` (e.g. `http://localhost:4000/api`).

## Architecture

**Backoffice SPA** — React 19, Vite 7, TypeScript, React Router 7, Zustand, TanStack Query v5, Axios, Tailwind v4, shadcn/ui.

### Auth flow

Authentication is **Firebase-first, backend-second**:

1. `BackofficeApp.tsx` subscribes to `onAuthStateChanged` (Firebase).
2. On a Firebase user, it calls `loginWithIdToken(idToken)` → `POST /auth/login` → receives `{ accessToken, user }`.
3. The JWT access token is stored **in memory only** (Zustand `useAuthStore`). No localStorage.
4. The Axios interceptor in `src/api/apiClient.ts` attaches `Authorization: Bearer <token>` to every request and handles 401s by refreshing via `firebaseUser.getIdToken(true)` + re-calling `POST /auth/login`. Concurrent 401s are queued.
5. Menus are fetched from `GET /user/menus` after authentication and stored in `useMenusStore` (persisted to `sessionStorage`).

### Route protection (`src/components/routes/ProtectedRoutes.tsx`)

- `AuthenticatedRoute` — redirects to `/auth/login` when unauthenticated.
- `NotAuthenticatedRoute` — redirects to `/` when already authenticated.
- `MenuProtectedRoute` — allows only paths that appear in the backend menu list; redirects to the first allowed path otherwise.

All admin routes use `React.lazy` + `<PageSuspense>` for code splitting.

### Data fetching pattern

Actions (`src/admin/actions/*.action.ts`) are thin wrappers around `apiClient`:

```ts
export const createBrandAction = async (brand: BrandCreate): Promise<BrandResponse> => {
  const { data } = await apiClient.post<BrandResponse>("/brands", brand);
  return data;
};
```

Query keys are centralized in `src/admin/queryKeys.ts` using the factory pattern (`brandKeys.all`, `brandKeys.list()`, etc.).

Pages use `useQuery` / `useMutation` from TanStack Query and call `queryClient.invalidateQueries` on mutation success.

### List page pattern

Most CRUD pages follow a shared pattern:

- **Page component** — `useQuery` for data, `useMutation` for actions, `useListPageState` for sheet/pagination state.
- **Columns file** — `ColumnDef[]` for `@tanstack/react-table`, receives callbacks (`onEdit`, `onToggleActive`) as props.
- **FormSheet component** — shadcn `<Sheet>` with `react-hook-form` + Zod, resets on `open` change via `useEffect`, single submit handler that branches create/update based on whether `editingItem` is null.
- **`useListPageState<T>()`** (`src/admin/hooks/useListPageState.ts`) — encapsulates `page`, `sheetOpen`, `editingItem`, and `openCreate` / `openEdit` / `handleSheetOpenChange` handlers.

### Forms

Forms use `react-hook-form` with `zodResolver` and the custom `<Field>` / `<FieldLabel>` / `<FieldError>` / `<FieldGroup>` / `<FieldSeparator>` components from `src/components/ui/field.tsx`. Use `<Controller>` for each field.

### Path alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Key files

| File | Purpose |
|------|---------|
| `src/BackofficeApp.tsx` | Root providers (QueryClient, Toaster) + `CheckAuthProvider` |
| `src/app.router.tsx` | All routes with lazy imports |
| `src/api/apiClient.ts` | Axios instance + 401 refresh interceptor |
| `src/auth/store/auth.store.ts` | Zustand auth state (token in memory, proactive refresh timer) |
| `src/auth/store/menus.store.ts` | Zustand menus state (sessionStorage persisted) + path helpers |
| `src/admin/queryKeys.ts` | Centralized TanStack Query key factories |
| `src/lib/firebase.ts` | Firebase app + auth instance |
| `src/interfaces/paginated-result.ts` | Generic `PaginatedResult<T>` for all list endpoints |
| `api-docs.json` | OpenAPI spec — source of truth for all backend endpoints and DTOs |

### Sidebar & Layout

- `AppSidebar` renders menu items from `useMenusStore`. Icon names from the backend are resolved via `ICON_MAP` (Lucide). Items with `id` in `DROPDOWN_ONLY_IDS` (`settings`, `profile`) are excluded from the sidebar and shown only in the user dropdown footer.
- `AdminLayout` wraps every admin page: `SidebarProvider` → `AppSidebar` + `<main>` with a sticky header and scrollable content area.
- The sidebar header (`SidebarHeader`) and the main sticky header both use `h-[57px]` to stay visually aligned.

### API docs

`api-docs.json` at the project root is the OpenAPI spec for the backend. Always check it before implementing new actions or interfaces to ensure the request/response shapes are correct. **Do not use `Read` or `Grep` to read `.pen` files.**

### Interfaces

TypeScript interfaces in `src/interfaces/` mirror backend DTOs. Keep them in sync with `api-docs.json` when the API changes. Key files:

| Interface file | Covers |
|---|---|
| `user.response.ts` | `UserResponse`, `RoleResponse`, `PermissionResponse` |
| `product.response.ts` | `ProductResponse`, `ProductDetailResponse`, `ProductImageResponse` |
| `purchase-invoice.response.ts` | `PurchaseInvoiceResponse`, `PurchaseInvoiceDetailResponse` |
| `bundle.response.ts` | `BundleResponse`, `BundleDetailResponse`, `SlabInBundleDetail` |
| `supplier-return.response.ts` | `SupplierReturnResponse`, `ReturnItemReason` |
| `general-payment.response.ts` | `GeneralPaymentResponse` |
| `job.response.ts` | `JobResponse`, `JobDetailResponse` |

### Status configs

Reusable status → label/style maps live in `src/lib/`:

- `src/lib/purchase-invoice-status.ts` — `INVOICE_STATUS_CONFIG`
- `src/lib/job-status.ts` — `JOB_STATUS_CONFIG`

Use `<StatusBadge>` from `src/components/ui/status-badge.tsx` for all status displays.
