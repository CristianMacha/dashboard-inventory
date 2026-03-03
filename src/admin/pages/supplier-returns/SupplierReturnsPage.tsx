import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, X } from "lucide-react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";

import { getSupplierReturnsAction } from "@/admin/actions/get-supplier-returns.action";
import { getAllSuppliersAction } from "@/admin/actions/get-all-suppliers.action";
import { supplierReturnKeys, supplierKeys } from "@/admin/queryKeys";
import { RETURN_STATUSES } from "@/lib/supplier-return-status";
import { supplierReturnColumns } from "./Columns";

const DEFAULT_PAGE_SIZE = 10;

function useBreakpoint(minWidth: number) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= minWidth : true,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [minWidth]);
  return matches;
}

export const SupplierReturnsPage = () => {
  const [page, setPage] = useState<number>(1);
  const [supplierId, setSupplierId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const isMd = useBreakpoint(768);
  const isLg = useBreakpoint(1024);

  const columnVisibility = useMemo(
    () => ({
      invoiceNumber: isLg,
      returnDate: isMd,
      createdAt: isLg,
    }),
    [isMd, isLg],
  );

  const handleSupplierChange = (value: string) => {
    setSupplierId(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      supplierId: supplierId || undefined,
      status: status || undefined,
    }),
    [page, supplierId, status],
  );

  const { data, isLoading } = useQuery({
    queryKey: supplierReturnKeys.list(queryParams),
    queryFn: () => getSupplierReturnsAction(queryParams),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: supplierKeys.all,
    queryFn: getAllSuppliersAction,
  });

  const clearFilters = useCallback(() => {
    setSupplierId("");
    setStatus("");
  }, []);

  const hasFilters = !!supplierId || !!status;

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
              <BreadcrumbPage>Supplier Returns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild>
          <Link to="/purchasing/supplier-returns/new">
            <PlusIcon className="size-4" />
            New Return
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={supplierId} onValueChange={handleSupplierChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All suppliers" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {RETURN_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={supplierReturnColumns}
          data={data?.data ?? []}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          emptyMessage="No supplier returns found. Create your first return to get started."
        />
        <div className="p-4 border-t bg-muted">
          <CustomPagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            totalCount={data?.total ?? 0}
            pageSize={DEFAULT_PAGE_SIZE}
            itemLabel="returns"
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
