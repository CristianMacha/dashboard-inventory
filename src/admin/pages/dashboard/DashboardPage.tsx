import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Box,
  Boxes,
  Layers,
  Package,
  Tag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getSummaryAction } from "@/admin/actions/get-summary.action";
import { useAuthStore } from "@/auth/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const METRIC_CARDS = [
  {
    key: "totalProducts" as const,
    label: "Total Products",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    href: "/products",
  },
  {
    key: "totalBundles" as const,
    label: "Bundles",
    icon: Boxes,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    href: "/products",
  },
  {
    key: "totalSlabs" as const,
    label: "Slabs",
    icon: Box,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    href: "/products",
  },
  {
    key: "totalBrands" as const,
    label: "Brands",
    icon: Tag,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    href: "/products",
  },
  {
    key: "totalCategories" as const,
    label: "Categories",
    icon: Layers,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    href: "/products",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Add Product",
    description: "Register a new product in the catalog",
    href: "/products/new",
    icon: Package,
  },
  {
    label: "View Products",
    description: "Browse and manage your product list",
    href: "/products",
    icon: Boxes,
  },
];

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummaryAction,
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl border bg-linear-to-br from-primary/10 via-accent/30 to-background px-6 py-5">
        <div className="relative z-10 flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s an overview of your inventory platform.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-primary/8 blur-2xl" />
        <div className="absolute -bottom-4 right-16 size-20 rounded-full bg-primary/5 blur-xl" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Overview
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg, href }) => (
            <Link key={key} to={href}>
              <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full group">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col gap-3">
                    <div className={`inline-flex size-9 items-center justify-center rounded-lg ${bg} transition-transform group-hover:scale-110`}>
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-12 mb-1" />
                      ) : (
                        <p className="text-2xl font-bold tabular-nums">
                          {data?.metrics[key] ?? 0}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, description, href, icon: Icon }) => (
            <Card key={href} className="hover:shadow-md hover:border-primary/30 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{label}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={href}>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
