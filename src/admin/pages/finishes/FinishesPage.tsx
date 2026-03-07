import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
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
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { useListPageState } from "@/admin/hooks/useListPageState";

import { getFinishesAction } from "@/admin/actions/get-finishes.action";
import { updateFinishAction } from "@/admin/actions/update-finish.action";
import { finishKeys } from "@/admin/queryKeys";
import type { FinishResponse } from "@/interfaces/finish.response";

import { finishColumns } from "./Columns";
import { FinishFormSheet } from "./components/FinishFormSheet";

export const FinishesPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingFinish,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<FinishResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: finishKeys.list(),
    queryFn: getFinishesAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (finish: FinishResponse) =>
      updateFinishAction(finish.id, { isActive: !finish.isActive }),
    onSuccess: (_, finish) => {
      void queryClient.invalidateQueries({ queryKey: finishKeys.lists() });
      toast.success(
        `Finish ${finish.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update finish status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = finishColumns({
    onEdit: openEdit,
    onToggleActive: (finish) => toggleActiveMutation.mutate(finish),
    togglingId,
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
              <BreadcrumbPage>Finishes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Finish
        </Button>
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <DataTable
            columns={columns}
            data={data ?? []}
            isLoading={isLoading}
            emptyMessage="No finishes found. Add your first finish to get started."
          />
        </div>
      )}

      <FinishFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingFinish={editingFinish}
      />
    </div>
  );
};
