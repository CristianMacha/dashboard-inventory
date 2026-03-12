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
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { useListPageState } from "@/admin/hooks/useListPageState";

import { getWorkshopMaterialsAction } from "@/admin/actions/get-workshop-materials.action";
import { deleteWorkshopMaterialAction } from "@/admin/actions/delete-workshop-material.action";
import { workshopMaterialKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import type { WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";

import { workshopMaterialColumns } from "./Columns";
import { WorkshopMaterialFormSheet } from "./components/WorkshopMaterialFormSheet";

const PAGE_LIMIT = 20;

export const WorkshopMaterialsPage = () => {
  const queryClient = useQueryClient();

  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingMaterial,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<WorkshopMaterialResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopMaterialKeys.list({ page, limit: PAGE_LIMIT }),
    queryFn: () => getWorkshopMaterialsAction({ page, limit: PAGE_LIMIT }),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (material: WorkshopMaterialResponse) =>
      deleteWorkshopMaterialAction(material.id),
    onSuccess: (_, material) => {
      void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.lists() });
      toast.success(`Material "${material.name}" deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to delete material");
    },
  });

  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables?.id ?? null)
    : null;

  const columns = workshopMaterialColumns({
    onEdit: openEdit,
    onDelete: (material) => deleteMutation.mutate(material),
    deletingId,
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
              <BreadcrumbPage>Workshop Materials</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Material
        </Button>
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="rounded-md border">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No materials found. Add your first material to get started."
          />
          <div className="border-t p-4 bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={PAGE_LIMIT}
              itemLabel="materials"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <WorkshopMaterialFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingMaterial={editingMaterial}
        page={page}
        limit={PAGE_LIMIT}
      />
    </div>
  );
};
