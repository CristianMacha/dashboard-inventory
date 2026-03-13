import { usePageParam } from "@/admin/hooks/usePageParam";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";

import { getJobPaymentsAction } from "@/admin/actions/get-job-payments.action";
import { jobPaymentKeys } from "@/admin/queryKeys";
import type { JobPaymentResponse } from "@/interfaces/job-payment.response";
import { formatDate } from "@/lib/format";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const jobPaymentColumns: ColumnDef<JobPaymentResponse>[] = [
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatDate(row.original.paymentDate)}
      </span>
    ),
  },
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => (
      <Button variant="link" size="sm" className="h-auto p-0 font-medium" asChild>
        <Link to={`/jobs/${row.original.jobId}`}>
          {row.original.projectName}
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {currency.format(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.paymentMethod === "CASH" ? "Cash" : "Bank Transfer"}
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) =>
      row.original.reference ? (
        <span className="text-sm tabular-nums">{row.original.reference}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Recorded At",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];

const DEFAULT_PAGE_SIZE = 10;

export const JobPaymentsPage = () => {
  const { page, setPage } = usePageParam();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handlePaymentMethodChange = useCallback((value: string) => {
    setPaymentMethod(value);
    setPage(1);
  }, []);

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
    setPage(1);
  }, []);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setPaymentMethod("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }, []);

  const hasFilters = !!paymentMethod || !!fromDate || !!toDate;

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      paymentMethod: paymentMethod || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, paymentMethod, fromDate, toDate],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: jobPaymentKeys.list(queryParams),
    queryFn: () => getJobPaymentsAction(queryParams),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Job Payments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">From</span>
          <Input
            type="date"
            className="w-[150px]"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">To</span>
          <Input
            type="date"
            className="w-[150px]"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <DataTable
            columns={jobPaymentColumns}
            data={data?.payments ?? []}
            isLoading={isLoading}
            emptyMessage="No job payments found."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="payments"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
