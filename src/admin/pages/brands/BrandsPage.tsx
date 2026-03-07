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

import { getBrandsAction } from "@/admin/actions/get-brands.action";
import { updateBrandAction } from "@/admin/actions/update-brand.action";
import { brandKeys } from "@/admin/queryKeys";
import type { BrandResponse } from "@/interfaces/brand.response";

import { brandColumns } from "./Columns";
import { BrandFormSheet } from "./components/BrandFormSheet";

export const BrandsPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingBrand,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<BrandResponse>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: brandKeys.list(),
    queryFn: getBrandsAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (brand: BrandResponse) =>
      updateBrandAction(brand.id, { isActive: !brand.isActive }),
    onSuccess: (_, brand) => {
      void queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success(
        `Brand ${brand.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update brand status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = brandColumns({
    onEdit: openEdit,
    onToggleActive: (brand) => toggleActiveMutation.mutate(brand),
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
              <BreadcrumbPage>Brands</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Brand
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
            emptyMessage="No brands found. Add your first brand to get started."
          />
        </div>
      )}

      <BrandFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingBrand={editingBrand}
      />
    </div>
  );
};
