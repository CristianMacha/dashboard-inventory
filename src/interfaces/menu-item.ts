/**
 * Menu item returned by the backend (user's allowed routes/menus).
 * Top-level items may have only id, label, icon, children (no path); children have path.
 */
export interface MenuItem {
  id?: string;
  /** Only present on leaf/child items. */
  path?: string;
  label: string;
  /** Icon name for Lucide (e.g. "warehouse", "box"). Optional. */
  icon?: string;
  permission?: string;
  role?: string;
  children?: MenuItem[];
}

export interface MenusResponse {
  menus: MenuItem[];
}
