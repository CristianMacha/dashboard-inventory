import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Plus, Search, X } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { useDebounce } from "@/hooks/useDebounce";
import { useListPageState } from "@/admin/hooks/useListPageState";

import { getRolesPaginatedAction } from "@/admin/actions/get-roles-paginated.action";
import { roleKeys } from "@/admin/queryKeys";
import type { RoleResponse } from "@/interfaces/user.response";

import { roleColumns } from "./Columns";
import { RoleFormSheet } from "./components/RoleFormSheet";

const DEFAULT_PAGE_SIZE = 10;

export const RolesPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingRole,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<RoleResponse>();

  const debouncedSearch = useDebounce(searchInput, 400);

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: roleKeys.list(queryParams),
    queryFn: () => getRolesPaginatedAction(queryParams),
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setPage(1);
    },
    [setPage, setSearchInput],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setPage(1);
  }, [setPage, setSearchInput]);

  const hasFilters = !!debouncedSearch;
  const columns = useMemo(() => roleColumns(openEdit), [openEdit]);

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
            <BreadcrumbPage>Roles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by role name…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}

        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Role
        </Button>
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No roles found."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="roles"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <RoleFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingRole={editingRole}
      />
    </div>
  );
};
