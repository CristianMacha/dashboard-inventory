import { useMemo } from "react";
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
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { useListPageState } from "@/admin/hooks/useListPageState";

import { getBundlesAction } from "@/admin/actions/get-bundles.action";
import { bundleKeys } from "@/admin/queryKeys";
import type { BundleResponse } from "@/interfaces/bundle.response";

import { bundleColumns } from "./Columns";
import { BundleFormSheet } from "./components/BundleFormSheet";

const DEFAULT_PAGE_SIZE = 10;

export const BundlesPage = () => {
  const {
    page,
    setPage,
    sheetOpen,
    editingItem: editingBundle,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<BundleResponse>();

  const { data, isLoading } = useQuery({
    queryKey: bundleKeys.list({ page, limit: DEFAULT_PAGE_SIZE }),
    queryFn: () => getBundlesAction({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const columns = useMemo(() => bundleColumns(openEdit), [openEdit]);

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
              <BreadcrumbPage>Bundles</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Bundle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyMessage="No bundles found. Add your first bundle to get started."
        />
        <div className="p-4 border-t bg-muted">
          <CustomPagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            totalCount={data?.total ?? 0}
            pageSize={DEFAULT_PAGE_SIZE}
            itemLabel="bundles"
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>

      <BundleFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingBundle={editingBundle}
      />
    </div>
  );
};
