import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";

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

import { getWorkshopCategoriesAction } from "@/admin/actions/get-workshop-categories.action";
import { workshopCategoryKeys } from "@/admin/queryKeys";
import type { WorkshopCategoryResponse } from "@/interfaces/workshop-category.response";

import { workshopCategoryColumns } from "./Columns";
import { WorkshopCategoryFormSheet } from "./components/WorkshopCategoryFormSheet";

export const WorkshopCategoriesPage = () => {
  const {
    sheetOpen,
    editingItem: editingCategory,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<WorkshopCategoryResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopCategoryKeys.list(),
    queryFn: getWorkshopCategoriesAction,
    staleTime: 5 * 60 * 1000,
  });

  const columns = workshopCategoryColumns({ onEdit: openEdit });

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
              <BreadcrumbPage>Workshop Categories</BreadcrumbPage>
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
            emptyMessage="No categories found. Add your first workshop category to get started."
          />
        </div>
      )}

      <WorkshopCategoryFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingCategory={editingCategory}
      />
    </div>
  );
};
