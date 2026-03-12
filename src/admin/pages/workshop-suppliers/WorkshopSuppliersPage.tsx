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

import { getWorkshopSuppliersAction } from "@/admin/actions/get-workshop-suppliers.action";
import { updateWorkshopSupplierAction } from "@/admin/actions/update-workshop-supplier.action";
import { workshopSupplierKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import type { WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";

import { workshopSupplierColumns } from "./Columns";
import { WorkshopSupplierFormSheet } from "./components/WorkshopSupplierFormSheet";

export const WorkshopSuppliersPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingSupplier,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<WorkshopSupplierResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopSupplierKeys.list(),
    queryFn: getWorkshopSuppliersAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (supplier: WorkshopSupplierResponse) =>
      updateWorkshopSupplierAction(supplier.id, { isActive: !supplier.isActive }),
    onSuccess: (_, supplier) => {
      void queryClient.invalidateQueries({ queryKey: workshopSupplierKeys.lists() });
      toast.success(
        `Supplier ${supplier.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update supplier status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = workshopSupplierColumns({
    onEdit: openEdit,
    onToggleActive: (supplier) => toggleActiveMutation.mutate(supplier),
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
              <BreadcrumbPage>Workshop Suppliers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Supplier
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
            emptyMessage="No suppliers found. Add your first workshop supplier to get started."
          />
        </div>
      )}

      <WorkshopSupplierFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingSupplier={editingSupplier}
      />
    </div>
  );
};
