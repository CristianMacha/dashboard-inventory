import type { MenuItem } from "@/interfaces/menu-item";
import { useQuery } from "@tanstack/react-query";
import { menuKeys } from "@/admin/queryKeys";
import { getMenusAction } from "../actions/get-menus.action";

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

export function getAllowedPaths(items: MenuItem[] | null | undefined): string[] {
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

export function useMenusQuery(enabled: boolean) {
  return useQuery({
    queryKey: menuKeys.all,
    queryFn: async () => {
      const { menus } = await getMenusAction();
      return resolveMenuPaths(menus);
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: Infinity,
  });
}
