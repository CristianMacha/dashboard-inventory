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
  TrendingDown,
  Wallet,
  Briefcase,
  FileText,
  Zap,
} from "lucide-react";
import { getSummaryAction } from "@/admin/actions/get-summary.action";
import { getJobsAction } from "@/admin/actions/get-jobs.action";
import { summaryKeys, jobKeys } from "@/admin/queryKeys";
import { useAuthStore } from "@/auth/store/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { QueryError } from "@/components/ui/query-error";
import { JOB_STATUS_CONFIG } from "@/lib/job-status";
import { formatDate } from "@/lib/format";

const METRIC_CARDS = [
  {
    key: "totalProducts" as const,
    label: "Products",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-500",
    href: "/products",
  },
  {
    key: "totalBundles" as const,
    label: "Bundles",
    icon: Boxes,
    color: "text-violet-600",
    bg: "bg-violet-500",
    href: "/bundles",
  },
  {
    key: "totalSlabs" as const,
    label: "Slabs",
    icon: Box,
    color: "text-amber-600",
    bg: "bg-amber-500",
    href: "/slabs",
  },
  {
    key: "totalBrands" as const,
    label: "Brands",
    icon: Tag,
    color: "text-emerald-600",
    bg: "bg-emerald-500",
    href: "/products",
  },
  {
    key: "totalCategories" as const,
    label: "Categories",
    icon: Layers,
    color: "text-rose-600",
    bg: "bg-rose-500",
    href: "/products",
  },
  {
    key: "totalJobs" as const,
    label: "Jobs",
    icon: Briefcase,
    color: "text-sky-600",
    bg: "bg-sky-500",
    href: "/jobs",
  },
  {
    key: "totalPurchaseInvoices" as const,
    label: "Invoices",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-500",
    href: "/purchase-invoices",
  },
];

const QUICK_ACTIONS = [
  {
    label: "New Job",
    description: "Create a job for a client",
    href: "/jobs/new",
    icon: Briefcase,
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "hover:border-sky-200 dark:hover:border-sky-800",
  },
  {
    label: "New Invoice",
    description: "Register a supplier invoice",
    href: "/purchase-invoices/new",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "hover:border-indigo-200 dark:hover:border-indigo-800",
  },
  {
    label: "Add Bundle",
    description: "Add a bundle to inventory",
    href: "/bundles",
    icon: Boxes,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "hover:border-violet-200 dark:hover:border-violet-800",
  },
  {
    label: "View Products",
    description: "Browse your product catalog",
    href: "/products",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function SectionHeader({
  icon: Icon,
  title,
  linkTo,
  linkLabel,
}: {
  icon: React.ElementType;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {linkLabel} <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: summaryKeys.all,
    queryFn: getSummaryAction,
  });

  const { data: recentJobsData, isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useQuery({
    queryKey: jobKeys.list({ page: 1, limit: 5 }),
    queryFn: () => getJobsAction({ page: 1, limit: 5 }),
  });
  const recentJobs = recentJobsData?.data ?? [];

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const metrics = data
    ? { ...data.inventory, ...data.projects, ...data.purchasing }
    : undefined;

  const balance = data?.accounting?.cashBalance ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/10 via-primary/5 to-background px-7 py-6">
        <div className="relative z-10">
          <p className="text-xs font-medium text-primary/70 uppercase tracking-widest mb-1">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Good day, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your inventory platform.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-6 right-20 size-24 rounded-full bg-primary/4 blur-2xl" />
      </div>

      {/* Overview metrics */}
      <div>
        <SectionHeader icon={TrendingUp} title="Overview" />
        {isError ? (
          <QueryError onRetry={() => void refetch()} />
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg, href }) => (
            <Link key={key} to={href}>
              <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div
                      className={`inline-flex size-8 items-center justify-center rounded-lg ${bg} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="size-4 text-white" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-10 mb-1" />
                      ) : (
                        <p className="text-2xl font-bold tabular-nums">
                          {metrics?.[key] ?? 0}
                        </p>
                      )}
                      <p className={`text-xs font-medium ${color}`}>{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        )}
      </div>

      {/* Cashflow summary */}
      <div>
        <SectionHeader
          icon={Wallet}
          title="Cashflow"
          linkTo="/accounting/cashflow"
          linkLabel="View details"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ingress */}
          <Card className="border-green-100 dark:border-green-950/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Total Ingress
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28 mb-3" />
                  ) : (
                    <p className="text-2xl font-bold tabular-nums text-green-600 mb-2">
                      {currencyFormatter.format(data?.accounting?.totalIngress ?? 0)}
                    </p>
                  )}
                  <div className="space-y-1 border-t pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Job payments</span>
                      {isLoading ? (
                        <Skeleton className="h-3 w-14" />
                      ) : (
                        <span className="tabular-nums font-medium">
                          {currencyFormatter.format(data?.accounting?.totalIngress ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40">
                  <TrendingUp className="size-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Egress */}
          <Card className="border-red-100 dark:border-red-950/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Total Egress
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28 mb-3" />
                  ) : (
                    <p className="text-2xl font-bold tabular-nums text-red-600 mb-2">
                      {currencyFormatter.format(data?.accounting?.totalEgress ?? 0)}
                    </p>
                  )}
                  <div className="space-y-1 border-t pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Invoice payments</span>
                      {isLoading ? (
                        <Skeleton className="h-3 w-14" />
                      ) : (
                        <span className="tabular-nums font-medium">
                          {currencyFormatter.format(data?.accounting?.totalEgress ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
                  <TrendingDown className="size-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card
            className={
              balance >= 0
                ? "border-blue-100 dark:border-blue-950/50"
                : "border-red-100 dark:border-red-950/50"
            }
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Cash Balance
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28 mb-3" />
                  ) : (
                    <p
                      className={`text-2xl font-bold tabular-nums mb-2 ${
                        balance >= 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {currencyFormatter.format(balance)}
                    </p>
                  )}
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground">
                      Ingress − Egress
                    </p>
                  </div>
                </div>
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    balance >= 0
                      ? "bg-blue-100 dark:bg-blue-950/40"
                      : "bg-red-100 dark:bg-red-950/40"
                  }`}
                >
                  <Wallet
                    className={`size-5 ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader icon={Zap} title="Quick Actions" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, description, href, icon: Icon, color, bg, border }) => (
            <Link key={href} to={href}>
              <Card
                className={`h-full transition-all hover:shadow-md ${border} group`}
              >
                <CardContent className="p-4">
                  <div
                    className={`inline-flex size-9 items-center justify-center rounded-lg ${bg} mb-3 transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`size-4 ${color}`} />
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <SectionHeader
          icon={Briefcase}
          title="Recent Jobs"
          linkTo="/jobs"
          linkLabel="View all"
        />
        {jobsError ? (
          <QueryError onRetry={() => void refetchJobs()} />
        ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Project Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-36" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="h-4 w-14 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : recentJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No jobs yet.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-medium hover:text-primary hover:underline transition-colors"
                        >
                          {job.projectName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.clientName}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={JOB_STATUS_CONFIG[job.status].label}
                          className={JOB_STATUS_CONFIG[job.status].className}
                        />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {currencyFormatter.format(job.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {formatDate(job.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        )}
      </div>
    </div>
  );
};
