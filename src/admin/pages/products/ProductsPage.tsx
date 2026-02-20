import { useState, useMemo, useCallback } from "react";
import { Summary } from "./components/Summary";
import { ProductFilters } from "./components/ProductFilters";
import type { ProductFiltersValue } from "./components/ProductFilters";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/admin/actions/get-products.action";
import { productKeys } from "@/admin/queryKeys";
import { productColumns } from "./Columns";
import { DataTable } from "./DataTable";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import type { ProductResponse } from "@/interfaces/product.response";
import { BundleFormSheet } from "@/admin/pages/bundles/components/BundleFormSheet";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_FILTERS: ProductFiltersValue = {
  search: "",
  brandIds: [],
  categoryIds: [],
};

export const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersValue>(DEFAULT_FILTERS);
  const pageSize = DEFAULT_PAGE_SIZE;
  const isMobile = useIsMobile();

  const [bundleSheetOpen, setBundleSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);

  const columnVisibility = useMemo(
    () => (isMobile ? { category: false, brand: false } : undefined),
    [isMobile],
  );

  const queryParams = {
    page,
    limit: pageSize,
    search: filters.search || undefined,
    brandId: filters.brandIds.length > 0 ? filters.brandIds : undefined,
    categoryId: filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => getProductsAction(queryParams),
  });

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  const handleFiltersChange = useCallback((next: ProductFiltersValue) => {
    setFilters(next);
    setPage(1);
  }, []);

  const handleAddBundle = (product: ProductResponse) => {
    setSelectedProduct(product);
    setBundleSheetOpen(true);
  };

  const handleBundleSheetOpenChange = (open: boolean) => {
    setBundleSheetOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const columns = useMemo(
    () => productColumns(handleAddBundle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild>
          <Link to="/products/new">
            <PlusIcon className="size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Summary />

      <ProductFilters filters={filters} onChange={handleFiltersChange} />

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          columnVisibility={columnVisibility}
          tableClassName={isMobile ? undefined : "min-w-[600px]"}
          isLoading={isLoading}
          emptyMessage="No products found. Try adjusting your filters."
        />
        <div className="p-4 border-t bg-muted">
          <CustomPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemLabel="products"
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </div>

      <BundleFormSheet
        open={bundleSheetOpen}
        onOpenChange={handleBundleSheetOpenChange}
        editingBundle={null}
        prefilledProduct={
          selectedProduct
            ? { id: selectedProduct.id, name: selectedProduct.name }
            : undefined
        }
      />
    </div>
  );
};
