import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, Search, X, Scissors } from "lucide-react";
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
import { useListPageState } from "@/admin/hooks/useListPageState";
import { useDebounce } from "@/hooks/useDebounce";

import { getSlabsAction } from "@/admin/actions/get-slabs.action";
import { slabKeys } from "@/admin/queryKeys";
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

  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingSlab,
    openCreate,
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

  const columns = useMemo(() => slabColumns(openEdit), [openEdit]);

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
              <BreadcrumbPage>Slabs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Slab
        </Button>
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
