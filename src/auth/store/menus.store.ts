import type { MenuItem } from "@/interfaces/menu-item";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getMenusAction } from "../actions/get-menus.action";

type MenusStatus = "idle" | "loading" | "success" | "error";

type MenusStore = {
  items: MenuItem[] | null;
  status: MenusStatus;
  error: string | null;
  fetchMenus: () => Promise<void>;
  reset: () => void;
};

const initialState = {
  items: null,
  status: "idle" as MenusStatus,
  error: null,
};

/**
 * Recursively resolve child paths that the backend sends as relative
 * (e.g. `/finishes`) into absolute paths based on their parent
 * (e.g. `/products/finishes`).
 */
function resolveMenuPaths(items: MenuItem[], parentPath = ""): MenuItem[] {
  return items.map((item) => {
    const resolvedPath =
      item.path && parentPath && !item.path.startsWith(parentPath)
        ? `${parentPath}${item.path}`
        : item.path;

    return {
      ...item,
      path: resolvedPath,
      children: item.children
        ? resolveMenuPaths(item.children, resolvedPath ?? parentPath)
        : undefined,
    };
  });
}

export const useMenusStore = create<MenusStore>()(
  persist(
    (set) => ({
      ...initialState,
      fetchMenus: async () => {
        set({ status: "loading", error: null });
        try {
          const { menus } = await getMenusAction();
          set({
            items: resolveMenuPaths(menus),
            status: "success",
            error: null,
          });
        } catch (err) {
          set({
            items: null,
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
      reset: () => set(initialState),
    }),
    {
      name: "menus-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items, status: state.status }),
    },
  ),
);

/**
 * Returns all allowed paths from menu items (flat). Only items with path are collected
 * (top-level groups in the API have no path; only their children do).
 */
export function getAllowedPaths(items: MenuItem[] | null): string[] {
  if (!items?.length) return [];
  const paths: string[] = [];
  function collect(menuItems: MenuItem[]) {
    for (const item of menuItems) {
      if (item.path) paths.push(item.path);
      if (item.children?.length) collect(item.children);
    }
  }
  collect(items);
  return paths;
}

/**
 * Returns true if the given pathname is allowed by the menus.
 * - Exact match: /products matches /products
 * - Nested match: /products/123 matches if /products is in menus
 */
export function isPathAllowed(
  pathname: string,
  allowedPaths: string[],
): boolean {
  if (allowedPaths.length === 0) return false;
  const normalized = pathname.replace(/\/$/, "") || "/";
  return allowedPaths.some(
    (path) => normalized === path || normalized.startsWith(`${path}/`),
  );
}
