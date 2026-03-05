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

import { getAllSuppliersAction } from "@/admin/actions/get-all-suppliers.action";
import { updateSupplierAction } from "@/admin/actions/update-supplier.action";
import { supplierKeys } from "@/admin/queryKeys";
import type { SupplierResponse } from "@/interfaces/supplier.response";

import { supplierColumns } from "./Columns";
import { SupplierFormSheet } from "./components/SupplierFormSheet";

export const SuppliersPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingSupplier,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<SupplierResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: supplierKeys.all,
    queryFn: getAllSuppliersAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (supplier: SupplierResponse) =>
      updateSupplierAction(supplier.id, {
        name: supplier.name,
        abbreviation: supplier.abbreviation,
        isActive: !supplier.isActive,
      }),
    onSuccess: (_, supplier) => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(
        `Supplier ${supplier.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update supplier status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = supplierColumns({
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
              <BreadcrumbPage>Suppliers</BreadcrumbPage>
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
            emptyMessage="No suppliers found. Add your first supplier to get started."
          />
        </div>
      )}

      <SupplierFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingSupplier={editingSupplier}
      />
    </div>
  );
};
