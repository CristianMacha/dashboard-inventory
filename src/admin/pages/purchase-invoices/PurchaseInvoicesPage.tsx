import { usePageParam } from "@/admin/hooks/usePageParam";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, Search, X } from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";

import { getPurchaseInvoicesAction } from "@/admin/actions/get-purchase-invoices.action";
import { getAllSuppliersAction } from "@/admin/actions/get-all-suppliers.action";
import { purchaseInvoiceKeys, supplierKeys } from "@/admin/queryKeys";
import { INVOICE_STATUSES } from "@/lib/purchase-invoice-status";
import { purchaseInvoiceColumns } from "./Columns";

const DEFAULT_PAGE_SIZE = 10;

export const PurchaseInvoicesPage = () => {
  const { page, setPage } = usePageParam();
  const [searchInput, setSearchInput] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      supplierId: supplierId || undefined,
      status: status || undefined,
    }),
    [page, debouncedSearch, supplierId, status],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: purchaseInvoiceKeys.list(queryParams),
    queryFn: () => getPurchaseInvoicesAction(queryParams),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: supplierKeys.all,
    queryFn: getAllSuppliersAction,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleSupplierChange = useCallback((value: string) => {
    setSupplierId(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSupplierId("");
    setStatus("");
    setPage(1);
  }, []);

  const hasFilters = !!debouncedSearch || !!supplierId || !!status;

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
              <BreadcrumbPage>Purchase Invoices</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild>
          <Link to="/purchase-invoices/new">
            <PlusIcon className="size-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by invoice number…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

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
            {INVOICE_STATUSES.map((s) => (
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

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <DataTable
            columns={purchaseInvoiceColumns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No invoices found. Create your first purchase invoice to get started."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="invoices"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
