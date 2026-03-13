import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Search, X } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { useListPageState } from "@/admin/hooks/useListPageState";
import { useDebounce } from "@/hooks/useDebounce";

import { getUsersAction } from "@/admin/actions/get-users.action";
import { getRolesAction } from "@/admin/actions/get-roles.action";
import { userKeys, roleKeys } from "@/admin/queryKeys";
import type { UserResponse } from "@/interfaces/user.response";

import { userColumns } from "./Columns";
import { UserFormSheet } from "./components/UserFormSheet";

const DEFAULT_PAGE_SIZE = 10;

export const UsersPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [roleId, setRoleId] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingUser,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<UserResponse>();

  const { data: rolesData } = useQuery({
    queryKey: roleKeys.all,
    queryFn: getRolesAction,
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      roleId: roleId || undefined,
    }),
    [page, debouncedSearch, roleId],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => getUsersAction(queryParams),
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setPage(1);
    },
    [setPage],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setRoleId(value);
      setPage(1);
    },
    [setPage],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setRoleId("");
    setPage(1);
  }, [setPage]);

  const hasFilters = !!debouncedSearch || !!roleId;
  const columns = useMemo(() => userColumns(openEdit), [openEdit]);

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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Select value={roleId} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            {(rolesData ?? []).map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
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
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No users found."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="users"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingUser={editingUser}
      />
    </div>
  );
};
