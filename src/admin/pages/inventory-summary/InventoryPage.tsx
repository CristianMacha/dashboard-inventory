import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Search, X, Box, Layers, SquareStack, AreaChart } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";

import { getInventorySummaryAction } from "@/admin/actions/get-inventory-summary.action";
import { inventoryKeys } from "@/admin/queryKeys";
import type { ProductInventorySummary } from "@/interfaces/inventory-summary.response";

const areaFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function StatusPill({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {count} {label}
    </span>
  );
}

function ProductRow({ product }: { product: ProductInventorySummary }) {
  const { slabsByStatus } = product;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <Link
          to={`/products/${product.productId}/detail`}
          className="font-medium hover:text-primary hover:underline transition-colors"
        >
          {product.productName}
        </Link>
      </td>
      <td className="px-4 py-3 text-center tabular-nums">{product.bundleCount}</td>
      <td className="px-4 py-3 text-center tabular-nums">{product.totalSlabs}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {slabsByStatus.available > 0 && (
            <StatusPill label="avail." count={slabsByStatus.available} className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" />
          )}
          {slabsByStatus.reserved > 0 && (
            <StatusPill label="reserved" count={slabsByStatus.reserved} className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400" />
          )}
          {slabsByStatus.sold > 0 && (
            <StatusPill label="sold" count={slabsByStatus.sold} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" />
          )}
          {slabsByStatus.returning > 0 && (
            <StatusPill label="returning" count={slabsByStatus.returning} className="bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" />
          )}
          {slabsByStatus.returned > 0 && (
            <StatusPill label="returned" count={slabsByStatus.returned} className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm">
        {areaFormatter.format(product.availableAreaM2)} m²
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-muted-foreground">
        {areaFormatter.format(product.totalAreaM2)} m²
      </td>
    </tr>
  );
}

function ProductRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
      <td className="px-4 py-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="px-4 py-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-32 rounded-full" /></td>
      <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
    </tr>
  );
}

export const InventoryPage = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => getInventorySummaryAction(),
  });

  const products = data?.products ?? [];

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const lower = search.toLowerCase();
    return products.filter((p) =>
      p.productName.toLowerCase().includes(lower),
    );
  }, [products, search]);

  const totalAvailable = useMemo(
    () => products.reduce((acc, p) => acc + p.slabsByStatus.available, 0),
    [products],
  );

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Inventory</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Summary</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            {
              label: "Products",
              value: data?.totalProducts,
              icon: Box,
              color: "text-blue-600",
              bg: "bg-blue-500",
            },
            {
              label: "Total Bundles",
              value: data?.totalBundles,
              icon: Layers,
              color: "text-violet-600",
              bg: "bg-violet-500",
            },
            {
              label: "Available Slabs",
              value: totalAvailable,
              icon: SquareStack,
              color: "text-green-600",
              bg: "bg-green-500",
            },
            {
              label: "Available Area",
              value: data ? `${areaFormatter.format(data.totalAvailableAreaM2)} m²` : undefined,
              icon: AreaChart,
              color: "text-amber-600",
              bg: "bg-amber-500",
            },
          ] as const
        ).map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className="size-4 text-white" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mb-0.5" />
                ) : (
                  <p className="text-xl font-bold tabular-nums">{value ?? 0}</p>
                )}
                <p className={`text-xs font-medium ${color}`}>{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by product name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Bundles
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Total Slabs
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Status Breakdown
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Available Area
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Total Area
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <ProductRowSkeleton key={i} />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      {search ? "No products match your search." : "No inventory data available."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <ProductRow key={product.productId} product={product} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && filteredProducts.length > 0 && (
            <div className="px-4 py-2.5 border-t bg-muted/20 text-xs text-muted-foreground">
              {filteredProducts.length} of {data?.totalProducts ?? 0} products
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
