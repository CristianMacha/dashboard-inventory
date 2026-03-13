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

import { getWorkshopToolsAction } from "@/admin/actions/get-workshop-tools.action";
import { deleteWorkshopToolAction } from "@/admin/actions/delete-workshop-tool.action";
import { workshopToolKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopToolResponse } from "@/interfaces/workshop-tool.response";

import { workshopToolColumns } from "./Columns";
import { WorkshopToolFormSheet } from "./components/WorkshopToolFormSheet";

const PAGE_LIMIT = 20;

export const WorkshopToolsPage = () => {
  const queryClient = useQueryClient();

  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingTool,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<WorkshopToolResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopToolKeys.list({ page, limit: PAGE_LIMIT }),
    queryFn: () => getWorkshopToolsAction({ page, limit: PAGE_LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (tool: WorkshopToolResponse) => deleteWorkshopToolAction(tool.id),
    onSuccess: (_, tool) => {
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.lists() });
      toast.success(`Tool "${tool.name}" deleted successfully`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete tool"));
    },
  });

  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables?.id ?? null)
    : null;

  const columns = workshopToolColumns({
    onEdit: openEdit,
    onDelete: (tool) => deleteMutation.mutate(tool),
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
              <BreadcrumbPage>Workshop Tools</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Tool
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
            emptyMessage="No tools found. Add your first tool to get started."
          />
          <div className="border-t p-4 bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={PAGE_LIMIT}
              itemLabel="tools"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <WorkshopToolFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingTool={editingTool}
        page={page}
        limit={PAGE_LIMIT}
      />
    </div>
  );
};
