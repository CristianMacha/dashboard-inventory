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

Copy `.env.sample` to `.env`. Required variables:

| Variable | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` |
| `VITE_FIREBASE_API_KEY` | Firebase public API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `project-id` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

All variables are validated at startup via Zod in `src/lib/env.ts` — missing vars throw immediately.

## Architecture

**GI Backoffice SPA** — React 19, Vite 7, TypeScript 5.9, React Router 7, Zustand 5, TanStack Query v5, Axios, Tailwind v4, shadcn/ui.

### Auth flow

Authentication is **Firebase-first, backend-second**:

1. `BackofficeApp.tsx` subscribes to `onAuthStateChanged` (Firebase).
2. On a Firebase user, calls `loginWithIdToken(idToken)` → `POST /auth/login` → receives `{ accessToken, user }`.
3. The JWT access token is stored **in memory only** (Zustand `useAuthStore`). No localStorage, no sessionStorage.
4. The Axios interceptor in `src/api/apiClient.ts` attaches `Authorization: Bearer <token>` to every request and handles 401s by refreshing via `firebaseUser.getIdToken(true)` + re-calling `POST /auth/login`. Concurrent 401s are queued via a mutex (`isRefreshing` + `pendingQueue`).
5. Token auto-refreshes 60 seconds before the 1-hour TTL via a scheduled timer in `useAuthStore`.
6. Menus are fetched from `GET /user/menus` after login and stored in `useMenusStore` (persisted to `sessionStorage`).

### Route protection (`src/components/routes/ProtectedRoutes.tsx`)

- `AuthenticatedRoute` — redirects to `/auth/login` when unauthenticated.
- `NotAuthenticatedRoute` — redirects to `/` when already authenticated.
- `MenuProtectedRoute` — allows only paths present in the backend-provided menu list; redirects to the first allowed path otherwise. Shows `MenusErrorScreen` on fetch error or empty menus.

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

### `useFormSheet` hook

`src/admin/hooks/useFormSheet.ts` is a generic hook for create/edit form flows. It handles:

- Form reset when the sheet opens (empty for create, populated for edit).
- `createMutation` and `updateMutation` with automatic query invalidation and success/error toasts.
- Returns `{ form, isSubmitting, onSubmit }`.

Use it when a page has a standard create/edit sheet and the mutation signatures match `(values) => Promise<T>` / `(id, values) => Promise<T>`.

### Forms

Forms use `react-hook-form` with `zodResolver` and the custom `<Field>` / `<FieldLabel>` / `<FieldError>` / `<FieldGroup>` / `<FieldSeparator>` components from `src/components/ui/field.tsx`. Use `<Controller>` for each field.

### Payment panel pattern

`src/admin/components/PaymentPanel.tsx` is a composite reusable component used across Invoice payments, Job payments, and General payments. It accepts:

- `queryKey` / `queryFn` — for fetching the payment summary (`totalPaid`, `remaining`, `payments[]`).
- `mutationFn` — for recording a new payment.
- `totalAmount` — the total to pay against (number or derived from data).
- `canRecordPayment` — permission guard; hides the "Record Payment" button when false.

Exported sub-components: `PaymentProgress`, `PaymentHistoryTable`, `PaymentSummaryCard`, `RecordPaymentSheet`.

### Status configs

Reusable status → label/style maps live in `src/lib/`:

- `src/lib/purchase-invoice-status.ts` — `INVOICE_STATUS_CONFIG`
- `src/lib/job-status.ts` — `JOB_STATUS_CONFIG`

Use `<StatusBadge>` from `src/components/ui/status-badge.tsx` for all status displays.

### Sidebar & Layout

- `AppSidebar` renders menu items from `useMenusStore`. Icon names from the backend are resolved via `ICON_MAP` (35 Lucide icons). Items with `id` in `DROPDOWN_ONLY_IDS` (`settings`, `profile`) are excluded from the sidebar and shown only in the user dropdown footer.
- `AdminLayout` wraps every admin page: `SidebarProvider` → `AppSidebar` + `<main>` with a sticky header and scrollable content area.
- The sidebar header (`SidebarHeader`) and the main sticky header both use `h-[57px]` to stay visually aligned.

### File management

`src/admin/pages/files/FilesPage.tsx` manages a hierarchical folder/file system per organization. Key patterns:

- `organizationId` is **derived** (not separately synced): `const organizationId = selectedOrgId || (orgs?.[0]?.id ?? "")`. The user can override via `<Select>`.
- Folder navigation state lives in `searchParams` (`folderId`). Breadcrumbs are computed by `useFolderAncestors`.
- Bulk selection uses `Set<string>` state. Inline rename uses a `renamingFolderId` / `renamingFileId` state.
- Do not use side effects inside React Query `select` functions — use derived values or `useEffect` only for true external sync.

### Path alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Key files

| File | Purpose |
|---|---|
| `src/BackofficeApp.tsx` | Root providers (QueryClient, Toaster) + `CheckAuthProvider` |
| `src/app.router.tsx` | All routes with lazy imports |
| `src/api/apiClient.ts` | Axios instance + 401 refresh interceptor + `getErrorMessage` helper |
| `src/auth/store/auth.store.ts` | Zustand auth state (token in memory, proactive refresh timer) |
| `src/auth/store/menus.store.ts` | Zustand menus state (sessionStorage) + `isPathAllowed` / `getAllowedPaths` |
| `src/admin/queryKeys.ts` | Centralized TanStack Query key factories (35 domains) |
| `src/lib/firebase.ts` | Firebase app + auth instance |
| `src/lib/env.ts` | Zod-validated env vars — fails fast on missing config |
| `src/lib/cloudinary.ts` | `getCloudinaryUrl(publicId, width?)` URL builder |
| `src/interfaces/paginated-result.ts` | Generic `PaginatedResult<T>` for all list endpoints |
| `api-docs.json` | OpenAPI spec — source of truth for all backend endpoints and DTOs |

### API docs

`api-docs.json` at the project root is the OpenAPI spec for the backend. **Always check it before implementing new actions or interfaces** to ensure the request/response shapes are correct.

**Do not use `Read` or `Grep` to read `.pen` files.**

### Interfaces

TypeScript interfaces in `src/interfaces/` mirror backend DTOs. Keep them in sync with `api-docs.json` when the API changes. Key files:

| Interface file | Covers |
|---|---|
| `user.response.ts` | `UserResponse`, `RoleResponse`, `PermissionResponse` |
| `user-authentication.ts` | Auth user with roles/permissions (stored in auth store) |
| `product.response.ts` | `ProductResponse`, `ProductDetailResponse`, `ProductImageResponse` |
| `purchase-invoice.response.ts` | `PurchaseInvoiceResponse`, `PurchaseInvoiceDetailResponse` |
| `bundle.response.ts` | `BundleResponse`, `BundleDetailResponse`, `SlabInBundleDetail` |
| `slab.response.ts` | `SlabResponse` |
| `supplier-return.response.ts` | `SupplierReturnResponse`, `ReturnItemReason` |
| `general-payment.response.ts` | `GeneralPaymentResponse` |
| `invoice-payment.response.ts` | `InvoicePaymentResponse` |
| `job-payment.response.ts` | `JobPaymentResponse` |
| `job.response.ts` | `JobResponse`, `JobDetailResponse` |
| `file.response.ts` | `FileRecordDto`, `FolderDto` |
| `workshop-*.response.ts` | Workshop tools, materials, categories, suppliers, requests, purchase orders |
| `cashflow.response.ts` | `CashflowResponse` |
| `inventory-summary.response.ts` | `InventorySummaryResponse` |

## Modules

### Core admin pages (~42 pages total)

| Module | Pages |
|---|---|
| Products | Products list, Product detail, Bundles, Bundle detail, Slabs, Categories, Brands, Finishes, Levels |
| Purchasing | Suppliers, Purchase Invoices, Invoice detail, Supplier Returns, Return detail |
| Jobs | Jobs list, Job detail |
| Payments | Invoice Payments, Job Payments, General Payments, Cashflow |
| Workshop | Tools, Tool detail, Materials, Material detail, Categories, Suppliers, Requests, My Requests, Purchase Orders, PO detail, Procurement Needs |
| Admin | Users, Roles, Settings, Profile |
| Files | Files (folder browser), File Search |

### Actions (~150 files in `src/admin/actions/`)

Actions are named `<verb>-<entity>.action.ts`. Common verbs: `get`, `create`, `update`, `delete`, `upload`, `download`, `rename`, `move`, `approve`, `cancel`, `record`, `bulk-*`, `link-*`, `unlink-*`.

## Adding a new feature

### New CRUD page checklist

1. **Check `api-docs.json`** for endpoint shapes before writing interfaces or actions.
2. **Add interface** in `src/interfaces/<entity>.response.ts` mirroring the backend DTO.
3. **Add actions** in `src/admin/actions/` — one file per operation.
4. **Add query keys** in `src/admin/queryKeys.ts` following the factory pattern.
5. **Add route** in `src/app.router.tsx` with `React.lazy` import inside the authenticated group.
6. **Build the page** following the list page pattern: `useQuery` + `useListPageState` + columns file + FormSheet.
7. **Use `useFormSheet`** if the create/edit mutation matches the standard signature.
8. **Use `<StatusBadge>`** for any status field; add a status config in `src/lib/` if needed.

### New payment flow

Reuse `<PaymentPanel>` — pass the query/mutation functions and `totalAmount`. Do not reimplement payment history or recording UI.

### Error handling

Use `getErrorMessage(error, fallback)` from `src/api/apiClient.ts` in mutation `onError` callbacks. It surfaces `ApiError` messages from the backend and falls back to the provided string for unknown errors.

### Derived state vs effects

Prefer deriving values directly over syncing state in `useEffect`. Only use `useEffect` for true external system synchronization (DOM, timers, subscriptions). Never call `setState` inside a React Query `select` function.
