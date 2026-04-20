import { useMemo, type ReactNode } from "react";
import { Navigate, useParams, Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  BoxIcon,
  CalendarIcon,
  LayersIcon,
  PackageIcon,
  Pencil,
  Plus,
  Star,
  Trash2,
  TruckIcon,
  Loader2,
} from "lucide-react";
import { useProductDetail } from "@/admin/hooks/useProductDetail";
import type { BundleInDetail, SlabInDetail } from "@/interfaces/product.response";
import { ProductImageUpload } from "@/admin/components/ProductImageUpload";
import { SLAB_STATUS_CONFIG } from "@/lib/slab-status";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProductSuppliersAction } from "@/admin/actions/get-product-suppliers.action";
import { linkProductSupplierAction } from "@/admin/actions/link-product-supplier.action";
import { unlinkProductSupplierAction } from "@/admin/actions/unlink-product-supplier.action";
import { setPrimaryProductSupplierAction } from "@/admin/actions/set-primary-product-supplier.action";
import { getActiveSuppliersAction } from "@/admin/actions/get-active-suppliers.action";
import { productSupplierKeys, supplierKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import { useState } from "react";

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <dt className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </dt>
      <dd className="text-sm font-semibold flex items-center gap-1">
        {icon}
        {value ?? <span className="text-muted-foreground font-normal">—</span>}
      </dd>
    </div>
  );
}

function SlabStatusBadge({ status }: { status: SlabInDetail["status"] }) {
  const config = SLAB_STATUS_CONFIG[status] ?? SLAB_STATUS_CONFIG.AVAILABLE;
  return <StatusBadge label={config.label} className={config.className} />;
}

function BundleCard({ bundle, index }: { bundle: BundleInDetail; index: number }) {
  const availableCount = bundle.slabs.filter(
    (s) => s.status === "AVAILABLE",
  ).length;
  const totalCount = bundle.slabs.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <PackageIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Bundle #{index + 1}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <TruckIcon className="size-3.5" />
                {bundle.supplierName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {bundle.lotNumber && (
              <StatusBadge
                label={bundle.lotNumber}
                className="bg-secondary text-secondary-foreground ring-1 ring-border"
              />
            )}
            {bundle.thicknessCm !== undefined && (
              <StatusBadge
                label={`${bundle.thicknessCm} cm`}
                className="bg-secondary text-secondary-foreground ring-1 ring-border"
              />
            )}
            <span className="text-muted-foreground text-xs">
              {availableCount}/{totalCount} available
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {bundle.slabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
            <LayersIcon className="size-8 mb-2 opacity-40" />
            No slabs in this bundle
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Dimensions</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Added
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundle.slabs.map((slab) => (
                  <TableRow key={slab.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {slab.code}
                    </TableCell>
                    <TableCell className="text-sm">{slab.dimensions}</TableCell>
                    <TableCell>
                      <SlabStatusBadge status={slab.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                      {slab.description ?? (
                        <span className="italic opacity-50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {formatDate(slab.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductSuppliersTab({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: productSupplierKeys.list(productId),
    queryFn: () => getProductSuppliersAction(productId),
  });

  const { data: allSuppliers = [] } = useQuery({
    queryKey: supplierKeys.active,
    queryFn: getActiveSuppliersAction,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: productSupplierKeys.list(productId),
    });

  const linkMutation = useMutation({
    mutationFn: () => linkProductSupplierAction(productId, selectedSupplierId),
    onSuccess: () => {
      toast.success("Supplier linked");
      setSelectedSupplierId("");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to link supplier")),
  });

  const unlinkMutation = useMutation({
    mutationFn: (productSupplierId: string) =>
      unlinkProductSupplierAction(productId, productSupplierId),
    onSuccess: () => {
      toast.success("Supplier unlinked");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to unlink supplier")),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (productSupplierId: string) =>
      setPrimaryProductSupplierAction(productId, productSupplierId),
    onSuccess: () => {
      toast.success("Primary supplier updated");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update primary supplier")),
  });

  const linkedIds = new Set(suppliers.map((s) => s.supplierId));
  const availableToLink = allSuppliers.filter((s) => !linkedIds.has(s.id));
  const isBusy = unlinkMutation.isPending || setPrimaryMutation.isPending;

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Link new supplier */}
        <div className="flex items-center gap-2 mb-4">
          <Select
            value={selectedSupplierId}
            onValueChange={setSelectedSupplierId}
            disabled={availableToLink.length === 0}
          >
            <SelectTrigger className="flex-1 max-w-xs">
              <SelectValue
                placeholder={
                  availableToLink.length === 0
                    ? "All suppliers already linked"
                    : "Select a supplier to link…"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableToLink.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!selectedSupplierId || linkMutation.isPending}
            onClick={() => linkMutation.mutate()}
          >
            {linkMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Link
          </Button>
        </div>

        {/* Linked suppliers table */}
        {suppliersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
            <TruckIcon className="size-8 mb-2 opacity-30" />
            <p>No suppliers linked to this product yet.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Supplier</TableHead>
                  <TableHead className="font-semibold">Abbreviation</TableHead>
                  <TableHead className="font-semibold">Primary</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.supplierName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.supplierAbbreviation ?? "—"}
                    </TableCell>
                    <TableCell>
                      {s.isPrimary ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 ring-1 ring-amber-200 rounded-full px-2 py-0.5 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800">
                          <Star className="size-3 fill-current" />
                          Primary
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        {!s.isPrimary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-amber-600"
                            disabled={isBusy}
                            onClick={() => setPrimaryMutation.mutate(s.id)}
                            aria-label="Set as primary"
                          >
                            {setPrimaryMutation.isPending && setPrimaryMutation.variables === s.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Star className="size-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          disabled={isBusy}
                          onClick={() => unlinkMutation.mutate(s.id)}
                          aria-label="Unlink supplier"
                        >
                          {unlinkMutation.isPending && unlinkMutation.variables === s.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductDetail(id ?? "");

  const { totalBundles, totalSlabs, availableSlabs } = useMemo(() => {
    const bundles = product?.bundles ?? [];
    return {
      totalBundles: bundles.length,
      totalSlabs: bundles.reduce((acc, b) => acc + b.slabs.length, 0),
      availableSlabs: bundles.reduce(
        (acc, b) => acc + b.slabs.filter((s) => s.status === "AVAILABLE").length,
        0,
      ),
    };
  }, [product?.bundles]);

  if (isError) {
    return <Navigate to="/products" replace />;
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BoxIcon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
              <StatusBadge
                label={product.isActive ? "Active" : "Inactive"}
                className={
                  product.isActive
                    ? "bg-green-100 text-green-800 ring-1 ring-green-200"
                    : "bg-muted text-muted-foreground ring-1 ring-border"
                }
              />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {product.description ?? "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link to="/products">
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/products/${product.id}`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Compact info strip */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            <InfoItem label="Category" value={product.category?.name} />
            <InfoItem label="Brand" value={product.brand?.name} />
            <InfoItem label="Level" value={product.level?.name} />
            <InfoItem label="Finish" value={product.finish?.name} />
            <InfoItem
              label="Slabs"
              value={`${availableSlabs} / ${totalSlabs} disponibles`}
            />
            <InfoItem label="Bundles" value={String(totalBundles)} />
            <InfoItem
              label="Creado"
              value={formatDate(product.createdAt)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Actualizado"
              value={formatDate(product.updatedAt)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="bundles" className="w-full">
        <TabsList>
          <TabsTrigger value="bundles">
            Bundles
            {totalBundles > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({totalBundles})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="images">
            Images
            {(product.images?.length ?? 0) > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({product.images?.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="mt-4 flex flex-col gap-4">
          {product.bundles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <PackageIcon className="size-10 mb-3 opacity-30" />
                <p className="font-medium">No bundles yet</p>
                <p className="text-sm mt-1">
                  Go to the Products list and use "Add Bundle" to register inventory.
                </p>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/products">Go to Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            product.bundles.map((bundle, i) => (
              <BundleCard key={bundle.id} bundle={bundle} index={i} />
            ))
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <ProductSuppliersTab productId={product.id} />
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ProductImageUpload
                productId={product.id}
                images={product.images ?? []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
