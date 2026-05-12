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

import { getWorkshopRequestsAction } from "@/admin/actions/get-workshop-requests.action";
import { approveWorkshopRequestAction } from "@/admin/actions/approve-workshop-request.action";
import { rejectWorkshopRequestAction } from "@/admin/actions/reject-workshop-request.action";
import { deliverWorkshopRequestAction } from "@/admin/actions/deliver-workshop-request.action";
import { workshopRequestKeys, procurementNeedsKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopRequestDto } from "@/interfaces/workshop-request.response";

import { workshopRequestColumns } from "./Columns";
import { CreateWorkshopRequestSheet } from "./components/CreateWorkshopRequestSheet";
import { RejectRequestDialog } from "./components/RejectRequestDialog";
import { ApproveRequestDialog } from "./components/ApproveRequestDialog";

const PAGE_LIMIT = 20;

export const WorkshopRequestsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") ?? undefined;
  const typeFilter = searchParams.get("requestType") ?? undefined;

  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<WorkshopRequestDto | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WorkshopRequestDto | null>(null);

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopRequestKeys.list({
      page,
      limit: PAGE_LIMIT,
      status: statusFilter,
      requestType: typeFilter,
    }),
    queryFn: () =>
      getWorkshopRequestsAction({
        page,
        limit: PAGE_LIMIT,
        status: statusFilter,
        requestType: typeFilter,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ request, approvedQuantity }: { request: WorkshopRequestDto; approvedQuantity?: number }) =>
      approveWorkshopRequestAction(request.id, approvedQuantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopRequestKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: procurementNeedsKeys.all });
      toast.success("Request approved");
      setApproveTarget(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve request"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ request, reason }: { request: WorkshopRequestDto; reason: string }) =>
      rejectWorkshopRequestAction(request.id, { rejectionReason: reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopRequestKeys.lists() });
      toast.success("Request rejected");
      setRejectTarget(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject request"));
    },
  });

  const deliverMutation = useMutation({
    mutationFn: (request: WorkshopRequestDto) => deliverWorkshopRequestAction(request.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopRequestKeys.lists() });
      toast.success("Request marked as delivered");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to deliver request"));
    },
  });

  const approvingId = approveMutation.isPending
    ? (approveMutation.variables?.request.id ?? null)
    : null;
  const rejectingId = rejectMutation.isPending
    ? (rejectMutation.variables?.request.id ?? null)
    : null;
  const deliveringId = deliverMutation.isPending
    ? (deliverMutation.variables?.id ?? null)
    : null;

  const columns = workshopRequestColumns({
    onApprove: (request) => setApproveTarget(request),
    onReject: (request) => setRejectTarget(request),
    onDeliver: (request) => deliverMutation.mutate(request),
    approvingId,
    rejectingId,
    deliveringId,
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
              <BreadcrumbPage>Workshop Requests</BreadcrumbPage>
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
            <SelectItem value="delivered">Delivered</SelectItem>
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
            emptyMessage="No requests found."
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

      <ApproveRequestDialog
        request={approveTarget}
        open={!!approveTarget}
        onOpenChange={(open) => { if (!open) setApproveTarget(null); }}
        onConfirm={(approvedQuantity) => {
          if (approveTarget) approveMutation.mutate({ request: approveTarget, approvedQuantity });
        }}
        isPending={approveMutation.isPending}
      />

      <RejectRequestDialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
        onConfirm={(reason) => {
          if (rejectTarget) rejectMutation.mutate({ request: rejectTarget, reason });
        }}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
};
