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

import { getCategoriesAction } from "@/admin/actions/get-categories.action";
import { updateCategoryAction } from "@/admin/actions/update-category.action";
import { categoryKeys } from "@/admin/queryKeys";
import type { CategoryResponse } from "@/interfaces/category.response";

import { categoryColumns } from "./Columns";
import { CategoryFormSheet } from "./components/CategoryFormSheet";

export const CategoriesPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingCategory,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<CategoryResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategoriesAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (category: CategoryResponse) =>
      updateCategoryAction(category.id, { isActive: !category.isActive }),
    onSuccess: (_, category) => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = categoryColumns({
    onEdit: openEdit,
    onToggleActive: (category) => toggleActiveMutation.mutate(category),
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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Category
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
            emptyMessage="No categories found. Add your first category to get started."
          />
        </div>
      )}

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingCategory={editingCategory}
      />
    </div>
  );
};
