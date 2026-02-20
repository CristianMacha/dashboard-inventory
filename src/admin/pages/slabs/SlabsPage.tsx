import { useState } from "react";
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

import { getSlabsAction } from "@/admin/actions/get-slabs.action";
import { slabKeys } from "@/admin/queryKeys";
import type { SlabResponse } from "@/interfaces/slab.response";

import { slabColumns } from "./Columns";
import { SlabFormSheet } from "./components/SlabFormSheet";

const DEFAULT_PAGE_SIZE = 10;

export const SlabsPage = () => {
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<SlabResponse | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: slabKeys.list({ page, limit: DEFAULT_PAGE_SIZE }),
    queryFn: () => getSlabsAction({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const openCreate = () => {
    setEditingSlab(null);
    setSheetOpen(true);
  };

  const openEdit = (slab: SlabResponse) => {
    setEditingSlab(slab);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingSlab(null);
  };

  const columns = slabColumns(openEdit);

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
              <BreadcrumbPage>Slabs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Slab
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyMessage="No slabs found. Add your first slab to get started."
        />
        <div className="p-4 border-t bg-muted">
          <CustomPagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            totalCount={data?.total ?? 0}
            pageSize={DEFAULT_PAGE_SIZE}
            itemLabel="slabs"
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>

      <SlabFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingSlab={editingSlab}
      />
    </div>
  );
};
