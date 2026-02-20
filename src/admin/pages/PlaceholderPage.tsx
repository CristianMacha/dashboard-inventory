import { useLocation } from "react-router";

/**
 * Placeholder for menu paths that don't have a dedicated route yet
 * (e.g. /inventory/products, /users from the backend menu).
 * Prevents redirect loops when MenuProtectedRoute redirects to the first allowed path.
 */
export const PlaceholderPage = () => {
  const { pathname } = useLocation();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Page</h1>
      <p className="text-muted-foreground mt-2">
        Route <code className="rounded bg-muted px-1.5 py-0.5">{pathname}</code>{" "}
        does not have content yet.
      </p>
    </div>
  );
};
