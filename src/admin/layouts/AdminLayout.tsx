import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Separator } from "@/components/ui/separator";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/products/new": "New Product",
  "/profile": "Profile",
  "/settings": "Settings",
};

function getPageLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith("/products/")) return "Edit Product";
  return "";
}

const AdminLayout = () => {
  const { pathname } = useLocation();
  const pageLabel = getPageLabel(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="bg-background relative flex w-full flex-1 flex-col">
        <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b h-[49px]">
          <div className="flex w-full items-center gap-2 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            {pageLabel && (
              <>
                <Separator orientation="vertical" className="h-4 shrink-0" />
                <span className="text-sm font-medium text-foreground/80 truncate">
                  {pageLabel}
                </span>
              </>
            )}
          </div>
        </header>
        <div className="px-4 md:px-6 py-4 md:py-6 bg-muted/30 min-h-[calc(100vh-49px)]">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
