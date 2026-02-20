import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  Boxes,
  LayoutDashboardIcon,
  Layers,
  LogOutIcon,
  Package,
  SettingsIcon,
  Shield,
  Tag,
  User,
  UserIcon,
  Users,
  Warehouse,
} from "lucide-react";
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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  LayoutDashboardIcon,
  Boxes,
  Box,
  User: UserIcon,
  UserIcon,
  Users,
  people: Users,
  person: User,
  Settings: SettingsIcon,
  SettingsIcon,
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
};

function getIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return LayoutDashboardIcon;
  return ICON_MAP[iconName] ?? LayoutDashboardIcon;
}

type SidebarMenuGroupsProps = {
  items: MenuItem[];
  pathname: string;
};

const SidebarMenuGroups = memo(function SidebarMenuGroups({
  items,
  pathname,
}: SidebarMenuGroupsProps) {
  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.id ?? group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.children?.map((item) => {
                if (!item.path) return null;
                const Icon = getIconComponent(item.icon);
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/" && pathname.startsWith(`${item.path}/`));
                return (
                  <SidebarMenuItem key={item.id ?? item.path}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={isActive}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link to={item.path}>
                        <Icon />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
});

export const AppSidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuthStore();
  const { items: menuItems, status: menusStatus } = useMenusStore();

  const items = menuItems ?? [];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="flex flex-col gap-2 p-2 border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="h-10 group-data-[collapsible=icon]:justify-center">
                <Link to="/">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Boxes strokeWidth={1.5} className="size-4" />
                  </div>
                  <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-sm tracking-tight">GI Backoffice</span>
                    <span className="text-xs text-muted-foreground">Management</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {menusStatus === "success" && items.length > 0 ? (
            <SidebarMenuGroups items={items} pathname={pathname} />
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
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
