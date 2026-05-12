import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router";
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

import { getWorkshopPurchaseOrdersAction } from "@/admin/actions/get-workshop-purchase-orders.action";
import { updateWorkshopPurchaseOrderStatusAction } from "@/admin/actions/update-workshop-purchase-order-status.action";
import { workshopPurchaseOrderKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopPurchaseOrderDto } from "@/interfaces/workshop-purchase-order.response";

import { workshopPurchaseOrderColumns } from "./Columns";
import { CreatePurchaseOrderSheet } from "./components/CreatePurchaseOrderSheet";

const PAGE_LIMIT = 20;

export const WorkshopPurchaseOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") ?? undefined;

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
    queryKey: workshopPurchaseOrderKeys.list({ page, limit: PAGE_LIMIT, status: statusFilter }),
    queryFn: () => getWorkshopPurchaseOrdersAction({ page, limit: PAGE_LIMIT, status: statusFilter }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      order,
      action,
    }: {
      order: WorkshopPurchaseOrderDto;
      action: "send" | "receive" | "cancel";
    }) => updateWorkshopPurchaseOrderStatusAction(order.id, action),
    onSuccess: (_, { action }) => {
      void queryClient.invalidateQueries({ queryKey: workshopPurchaseOrderKeys.lists() });
      const label = action === "send" ? "marked as sent" : action === "receive" ? "received" : "cancelled";
      toast.success(`Purchase order ${label}`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update purchase order"));
    },
  });

  const pendingId = statusMutation.isPending
    ? (statusMutation.variables?.order.id ?? null)
    : null;

  const columns = workshopPurchaseOrderColumns({
    onSend: (order) => statusMutation.mutate({ order, action: "send" }),
    onReceive: (order) => statusMutation.mutate({ order, action: "receive" }),
    onCancel: (order) => statusMutation.mutate({ order, action: "cancel" }),
    pendingId,
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
              <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => setSheetOpen(true)}>
          <PlusIcon className="size-4" />
          New Order
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
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
            emptyMessage="No purchase orders found."
          />
          <div className="border-t p-4 bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={PAGE_LIMIT}
              itemLabel="orders"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <CreatePurchaseOrderSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};
