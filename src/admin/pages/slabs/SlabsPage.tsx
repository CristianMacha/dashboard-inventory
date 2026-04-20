import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Scissors, Box, Layers, SquareStack, AreaChart } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { useListPageState } from "@/admin/hooks/useListPageState";
import { useDebounce } from "@/hooks/useDebounce";

import { getSlabsAction } from "@/admin/actions/get-slabs.action";
import { getInventorySummaryAction } from "@/admin/actions/get-inventory-summary.action";
import { reserveSlabAction } from "@/admin/actions/reserve-slab.action";
import { sellSlabAction } from "@/admin/actions/sell-slab.action";
import { markSlabAsReturningAction } from "@/admin/actions/mark-slab-as-returning.action";
import { slabKeys, inventoryKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import { SLAB_STATUSES } from "@/lib/slab-status";
import type { SlabResponse } from "@/interfaces/slab.response";

import { slabColumns } from "./Columns";
import { SlabFormSheet } from "./components/SlabFormSheet";

const DEFAULT_PAGE_SIZE = 10;

export const SlabsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [isRemnant, setIsRemnant] = useState<boolean | undefined>(undefined);
  const debouncedSearch = useDebounce(searchInput, 400);
  const queryClient = useQueryClient();

  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingSlab,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<SlabResponse>();

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status || undefined,
      isRemnant,
    }),
    [page, debouncedSearch, status, isRemnant],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: slabKeys.list(queryParams),
    queryFn: () => getSlabsAction(queryParams),
  });

  const { data: inventorySummary, isLoading: summaryLoading } = useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => getInventorySummaryAction(),
  });

  const invalidateSlabs = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: slabKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  }, [queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({
      slab,
      action,
    }: {
      slab: SlabResponse;
      action: "reserve" | "sell" | "returning";
    }) => {
      if (action === "reserve") return reserveSlabAction(slab.id);
      if (action === "sell") return sellSlabAction(slab.id);
      return markSlabAsReturningAction(slab.id);
    },
    onSuccess: (_, { action }) => {
      const labels = { reserve: "reserved", sell: "marked as sold", returning: "marked as returning" };
      toast.success(`Slab ${labels[action]}`);
      invalidateSlabs();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update slab status"));
    },
  });

  const handleStatusAction = useCallback(
    (slab: SlabResponse, action: "reserve" | "sell" | "returning") => {
      statusMutation.mutate({ slab, action });
    },
    [statusMutation],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, [setPage]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, [setPage]);

  const toggleRemnant = useCallback(() => {
    setIsRemnant((prev) => (prev === true ? undefined : true));
    setPage(1);
  }, [setPage]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatus("");
    setIsRemnant(undefined);
    setPage(1);
  }, [setPage]);

  const hasFilters = !!debouncedSearch || !!status || isRemnant !== undefined;

  const columns = useMemo(
    () => slabColumns(openEdit, handleStatusAction),
    [openEdit, handleStatusAction],
  );

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Slabs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            {
              label: "Total Slabs",
              value: inventorySummary?.totalSlabs,
              icon: Box,
              color: "text-amber-600",
              bg: "bg-amber-500",
            },
            {
              label: "Available",
              value: inventorySummary?.products.reduce(
                (acc, p) => acc + p.slabsByStatus.available,
                0,
              ),
              icon: SquareStack,
              color: "text-green-600",
              bg: "bg-green-500",
            },
            {
              label: "Bundles",
              value: inventorySummary?.totalBundles,
              icon: Layers,
              color: "text-violet-600",
              bg: "bg-violet-500",
            },
            {
              label: "Available Area",
              value: inventorySummary
                ? `${inventorySummary.totalAvailableAreaM2.toFixed(1)} m²`
                : undefined,
              icon: AreaChart,
              color: "text-blue-600",
              bg: "bg-blue-500",
            },
          ] as const
        ).map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon className="size-4 text-white" />
              </div>
              <div>
                {summaryLoading ? (
                  <Skeleton className="h-6 w-16 mb-0.5" />
                ) : (
                  <p className="text-xl font-bold tabular-nums">{value ?? 0}</p>
                )}
                <p className={`text-xs font-medium ${color}`}>{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by slab code…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {SLAB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={isRemnant ? "default" : "outline"}
          size="sm"
          onClick={toggleRemnant}
          className="gap-1.5"
        >
          <Scissors className="size-3.5" />
          Remnants
        </Button>

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
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No slabs found. Add your first slab to get started."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="slabs"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <SlabFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingSlab={editingSlab}
      />
    </div>
  );
};
