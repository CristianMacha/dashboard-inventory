# Frontend React (Backoffice)

Backoffice SPA built with React 19, Vite 7, TypeScript, React Router 7, Zustand, TanStack Query, Axios, Tailwind v4, and shadcn/ui. It uses JWT access tokens with refresh-token flow and cookie-based refresh.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm

### Install and run

```bash
pnpm install
cp .env.sample .env
# Edit .env and set VITE_API_URL (e.g. http://localhost:4000/api)
pnpm dev
```

### Build and preview

```bash
pnpm build
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Environment

| Variable       | Description                    |
| -------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backoffice API |

See `.env.sample` for a template.

## Auth flow

- **Login:** User submits email/password; API returns `accessToken` and `user`. Token is stored in memory (Zustand); requests use `Authorization: Bearer <token>`.
- **Refresh:** On 401, the Axios interceptor calls `/auth/refresh` (with credentials/cookies). New token and user are stored; failed requests are retried. Concurrent 401s are queued so only one refresh runs.
- **Logout:** Client calls `/auth/logout` and sets `token-revoked` in `localStorage` so the next load does not try to refresh with an old token.

## Project structure

```
src/
├── admin/              # Authenticated backoffice
│   ├── layouts/        # AdminLayout, AppSidebar
│   └── pages/          # Dashboard, Product, Profile, Settings
├── api/                # Axios instance and interceptors
├── auth/               # Auth feature
│   ├── actions/        # login, logout, refresh-token
│   ├── layouts/        # AuthLayout
│   ├── pages/          # Login, Register
│   └── store/          # auth.store (Zustand)
├── components/
│   ├── routes/         # AuthenticatedRoute, NotAuthenticatedRoute, MenuProtectedRoute
│   └── ui/             # shadcn components
├── interfaces/         # Shared TypeScript types
├── lib/                # Utilities
├── app.router.tsx      # React Router config
└── BackofficeApp.tsx   # Root providers and auth check
```

## Menus from backend

After authentication, the app fetches the user's allowed routes from **GET /user/menus**. The response shape is `{ items: MenuItem[] }` where each item has `path`, `label`, and optional `icon` (Lucide icon name), `permission`, `role`, and `children`. These items drive the sidebar and route protection.

- **Sidebar:** Renders menu items from the backend; unknown or missing icons fall back to a default.
- **Protection:** Only paths present in the menu list are accessible; otherwise the user is redirected to the first allowed path or `/`.

## Route protection

- **AuthenticatedRoute:** Renders children only when `status === 'authenticated'`; otherwise redirects to `/auth/login`.
- **NotAuthenticatedRoute:** Used for `/auth/*`; redirects to `/` when already authenticated.
- **MenuProtectedRoute:** Wraps the admin layout; only allows paths that appear in the user's menu list (from `/user/menus`). Redirects to the first allowed path or `/` when the current path is not allowed.

## Tech stack

- React 19, Vite 7, TypeScript 5.9
- React Router 7, Zustand, TanStack Query, Axios
- Tailwind v4, shadcn/ui (Radix), react-hook-form, Zod, Sonner
