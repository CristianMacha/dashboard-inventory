import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getMyWorkshopRequestsAction } from "@/admin/actions/get-my-workshop-requests.action";
import { workshopRequestKeys } from "@/admin/queryKeys";

import { workshopRequestReadOnlyColumns } from "./Columns";
import { CreateWorkshopRequestSheet } from "./components/CreateWorkshopRequestSheet";

const PAGE_LIMIT = 20;

export const MyWorkshopRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") ?? undefined;
  const typeFilter = searchParams.get("requestType") ?? undefined;

  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopRequestKeys.myList({
      page,
      limit: PAGE_LIMIT,
      status: statusFilter,
      requestType: typeFilter,
    }),
    queryFn: () =>
      getMyWorkshopRequestsAction({
        page,
        limit: PAGE_LIMIT,
        status: statusFilter,
        requestType: typeFilter,
      }),
  });

  const columns = workshopRequestReadOnlyColumns();

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
              <BreadcrumbPage>My Requests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => setSheetOpen(true)}>
          <PlusIcon className="size-4" />
          New Request
        </Button>
      </div>

      <div className="flex gap-2">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setFilter("status", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter ?? "all"}
          onValueChange={(v) => setFilter("requestType", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="material">Material</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="rounded-md border">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="You haven't made any requests yet."
          />
          <div className="border-t p-4 bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={PAGE_LIMIT}
              itemLabel="requests"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <CreateWorkshopRequestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};
