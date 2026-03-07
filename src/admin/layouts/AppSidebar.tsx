import { createElement, memo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Boxes,
  Briefcase,
  ChevronRight,
  FileText,
  LayoutDashboardIcon,
  Layers,
  LogOutIcon,
  Package,
  Receipt,
  SettingsIcon,
  Shield,
  ShoppingCart,
  Tag,
  User,
  UserIcon,
  Users,
  Warehouse,
} from "lucide-react";
import { Collapsible } from "radix-ui";
import { useAuthStore } from "@/auth/store/auth.store";
import { useMenusStore } from "@/auth/store/menus.store";
import type { MenuItem } from "@/interfaces/menu-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

/** Items that live in the user dropdown footer, not the sidebar. */
const DROPDOWN_ONLY_IDS = new Set(["settings", "profile"]);

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  LayoutDashboardIcon,
  dashboard: LayoutDashboardIcon,
  Boxes,
  Box,
  User: UserIcon,
  UserIcon,
  Users,
  people: Users,
  person: User,
  Settings: SettingsIcon,
  SettingsIcon,
  settings: SettingsIcon,
  warehouse: Warehouse,
  Warehouse,
  box: Box,
  tag: Tag,
  Tag,
  category: Layers,
  Layers,
  layers: Layers,
  package: Package,
  Package,
  shield: Shield,
  Shield,
  finish: Layers,
  level: Layers,
  supplier: Users,
  receipt: Receipt,
  Receipt,
  "purchase-invoice": Receipt,
  "purchase-invoices": Receipt,
  purchasing: ShoppingCart,
  ShoppingCart,
  briefcase: Briefcase,
  Briefcase,
  job: Briefcase,
  jobs: Briefcase,
  projects: Briefcase,
  fileText: FileText,
  FileText,
};

/**
 * Returns a stable JSX element for the given icon name.
 * Using a render helper (not a component variable) avoids the
 * "cannot create components during render" lint rule.
 */
function menuIcon(iconName?: string) {
  return createElement(ICON_MAP[iconName ?? ""] ?? LayoutDashboardIcon);
}

function isActive(item: MenuItem, pathname: string): boolean {
  if (item.path) {
    return (
      pathname === item.path ||
      (item.path !== "/" && pathname.startsWith(`${item.path}/`))
    );
  }
  return item.children?.some((c) => isActive(c, pathname)) ?? false;
}

// ─── Sub-level nav items (inside a group, depth >= 0) ────────────────────────

type NavItemProps = {
  item: MenuItem;
  pathname: string;
  depth?: number;
};

/**
 * Renders a menu item recursively.
 *
 * Three cases:
 *  1. Leaf (has path, no children)           → button link
 *  2. Path + children (e.g. Products)        → link button + collapsible chevron action
 *  3. No path + children (nested grouping)   → collapsible trigger only
 */
function NavItem({ item, pathname, depth = 0 }: NavItemProps) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const pathActive =
    !!item.path &&
    (pathname === item.path ||
      (item.path !== "/" && pathname.startsWith(`${item.path}/`)));
  const active = pathActive || isActive(item, pathname);

  // ── 1. Pure leaf ──────────────────────────────────────────────────────────
  if (!hasChildren) {
    if (!item.path) return null;

    if (depth === 0) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            size="sm"
            isActive={pathActive}
            tooltip={item.label}
          >
            <Link to={item.path}>
              {menuIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={pathActive}>
          <Link to={item.path}>
            {menuIcon(item.icon)}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  // ── 2. Has path + children (e.g. Products → Finishes/Levels/Suppliers) ────
  if (item.path) {
    const SubList = (
      <SidebarMenuSub>
        {(item.children ?? []).map((child) => (
          <NavItem
            key={child.id ?? child.path}
            item={child}
            pathname={pathname}
            depth={depth + 1}
          />
        ))}
      </SidebarMenuSub>
    );

    if (depth === 0) {
      return (
        <SidebarMenuItem>
          <Collapsible.Root
            defaultOpen={true}
            className="group/collapsible w-full"
          >
            <SidebarMenuButton
              asChild
              size="sm"
              isActive={pathActive}
              tooltip={item.label}
            >
              <Link to={item.path}>
                {menuIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
            <Collapsible.Trigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle {item.label}</span>
              </SidebarMenuAction>
            </Collapsible.Trigger>
            <Collapsible.Content>{SubList}</Collapsible.Content>
          </Collapsible.Root>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <Collapsible.Root
          defaultOpen={true}
          className="group/collapsible w-full"
        >
          <SidebarMenuSubButton asChild isActive={pathActive}>
            <Link to={item.path}>
              {menuIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuSubButton>
          <Collapsible.Trigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle {item.label}</span>
            </SidebarMenuAction>
          </Collapsible.Trigger>
          <Collapsible.Content>{SubList}</Collapsible.Content>
        </Collapsible.Root>
      </SidebarMenuSubItem>
    );
  }

  // ── 3. No path + children (pure collapsible group inside a section) ───────
  return (
    <SidebarMenuItem>
      <Collapsible.Root defaultOpen={true} className="group/collapsible w-full">
        <Collapsible.Trigger asChild>
          <SidebarMenuButton size="sm" isActive={active} tooltip={item.label}>
            {menuIcon(item.icon)}
            <span>{item.label}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <SidebarMenuSub>
            {(item.children ?? []).map((child) => (
              <NavItem
                key={child.id ?? child.path}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </Collapsible.Root>
    </SidebarMenuItem>
  );
}

// ─── Top-level nav renderer ──────────────────────────────────────────────────

type SidebarNavProps = {
  items: MenuItem[];
  pathname: string;
};

/**
 * Top-level items are split into two kinds:
 *  - Items with NO path + children  → SidebarGroup with a visible label (Inventory, Users…)
 *  - Items with a path (leaf or path+children at root) → lone SidebarGroup without label
 *
 * This ensures that when the sidebar collapses to icon mode, group children
 * remain visible as icon buttons (they're never hidden behind a collapsed trigger).
 */
const SidebarNav = memo(function SidebarNav({
  items,
  pathname,
}: SidebarNavProps) {
  const navItems = items.filter(
    (item) => !DROPDOWN_ONLY_IDS.has(item.id ?? ""),
  );

  return (
    <>
      {navItems.map((item) => {
        const hasChildren = (item.children?.length ?? 0) > 0;

        // Named section (Inventory, Users…) — collapsible group
        if (!item.path && hasChildren) {
          (item.children ?? []).some((c) => isActive(c, pathname));

          return (
            <Collapsible.Root
              key={item.id ?? item.label}
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <Collapsible.Trigger className="flex w-full items-center [&>svg]:ml-auto [&>svg]:size-4 [&>svg]:shrink-0">
                    {item.label}
                    <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </Collapsible.Trigger>
                </SidebarGroupLabel>
                <Collapsible.Content>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {(item.children ?? []).map((child) => (
                        <NavItem
                          key={child.id ?? child.path}
                          item={child}
                          pathname={pathname}
                          depth={0}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </Collapsible.Content>
              </SidebarGroup>
            </Collapsible.Root>
          );
        }

        // Standalone item (Dashboard) or root item with path+children
        return (
          <SidebarGroup key={item.id ?? item.label}>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem item={item} pathname={pathname} depth={0} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
});

// ─── Sidebar shell ───────────────────────────────────────────────────────────

export const AppSidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const { items: menuItems, status: menusStatus } = useMenusStore();

  const items = menuItems ?? [];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="flex flex-col justify-center p-2 border-b h-[57px] shrink-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="h-10 group-data-[collapsible=icon]:justify-center"
              >
                <Link to="/">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Boxes strokeWidth={1.5} className="size-4" />
                  </div>
                  <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm tracking-tight">
                      GI Backoffice
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Management
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {menusStatus === "success" && items.length > 0 ? (
            <SidebarNav items={items} pathname={pathname} />
          ) : (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm">
                      <Link to="/">
                        <LayoutDashboardIcon />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-10 group-data-[collapsible=icon]:justify-center">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {user?.name
                        ? user.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </span>
                    <span className="flex flex-col items-start text-left leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-sm font-medium">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-[--radix-popper-anchor-width] min-w-60"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserIcon />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <SettingsIcon />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => void logout()}
                  >
                    <LogOutIcon />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};
