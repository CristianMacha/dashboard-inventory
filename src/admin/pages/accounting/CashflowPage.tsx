import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarRange,
  X,
  Briefcase,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getCashflowAction } from "@/admin/actions/get-cashflow.action";
import { cashflowKeys } from "@/admin/queryKeys";
import { QueryError } from "@/components/ui/query-error";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function StatRow({
  icon: Icon,
  label,
  value,
  isLoading,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  isLoading: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
            positive
              ? "bg-green-100 dark:bg-green-950/40"
              : "bg-red-100 dark:bg-red-950/40"
          }`}
        >
          <Icon
            className={`size-3.5 ${positive ? "text-green-600" : "text-red-600"}`}
          />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-4 w-20" />
      ) : (
        <span
          className={`text-sm font-semibold tabular-nums ${
            positive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
          }`}
        >
          {currency.format(value)}
        </span>
      )}
    </div>
  );
}

export const CashflowPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: cashflowKeys.summary({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    queryFn: () =>
      getCashflowAction({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
  });

  const hasFilter = !!fromDate || !!toDate;
  const balance = data?.cashBalance ?? 0;
  const balancePositive = balance >= 0;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cashflow</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Wallet className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cashflow</h1>
          <p className="text-sm text-muted-foreground">
            Cash inflows from clients vs outflows to suppliers
          </p>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <CalendarRange className="size-4" />
          <span className="font-medium">Period</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-36 h-8 text-sm"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="h-8 gap-1.5 text-muted-foreground"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {isError && <QueryError onRetry={() => void refetch()} />}

      {/* Balance highlight */}
      <Card
        className={`border-2 ${
          balancePositive
            ? "border-blue-200 dark:border-blue-900/60"
            : "border-red-200 dark:border-red-900/60"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                Net Cash Balance
              </p>
              {isLoading ? (
                <Skeleton className="h-10 w-40" />
              ) : (
                <p
                  className={`text-4xl font-bold tabular-nums ${
                    balancePositive ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {currency.format(balance)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Total Ingress − Total Egress
              </p>
            </div>
            <div
              className={`flex size-16 items-center justify-center rounded-2xl ${
                balancePositive
                  ? "bg-blue-100 dark:bg-blue-950/40"
                  : "bg-red-100 dark:bg-red-950/40"
              }`}
            >
              <Wallet
                className={`size-8 ${balancePositive ? "text-blue-600" : "text-red-600"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingress / Egress breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ingress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                  Total Ingress
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold tabular-nums text-green-600">
                    {currency.format(data?.totalIngress ?? 0)}
                  </p>
                )}
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40">
                <ArrowUpRight className="size-5 text-green-600" />
              </div>
            </div>
            <div className="border-t divide-y">
              <StatRow
                icon={Briefcase}
                label="Job payments"
                value={data?.jobIncome ?? 0}
                isLoading={isLoading}
                positive
              />
              <StatRow
                icon={TrendingUp}
                label="General income"
                value={data?.generalIncome ?? 0}
                isLoading={isLoading}
                positive
              />
            </div>
          </CardContent>
        </Card>

        {/* Egress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                  Total Egress
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold tabular-nums text-red-600">
                    {currency.format(data?.totalEgress ?? 0)}
                  </p>
                )}
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
                <ArrowDownRight className="size-5 text-red-600" />
              </div>
            </div>
            <div className="border-t divide-y">
              <StatRow
                icon={Receipt}
                label="Invoice payments"
                value={data?.invoiceExpenses ?? 0}
                isLoading={isLoading}
                positive={false}
              />
              <StatRow
                icon={TrendingDown}
                label="General expenses"
                value={data?.generalExpenses ?? 0}
                isLoading={isLoading}
                positive={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
