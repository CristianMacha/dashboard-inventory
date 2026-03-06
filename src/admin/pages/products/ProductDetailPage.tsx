import { useMemo, type ReactNode } from "react";
import { Navigate, useParams, Link } from "react-router";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  BoxIcon,
  CalendarIcon,
  LayersIcon,
  PackageIcon,
  Pencil,
  TruckIcon,
} from "lucide-react";
import { useProductDetail } from "@/admin/hooks/useProductDetail";
import type { BundleInDetail, SlabInDetail } from "@/interfaces/product.response";
import { ProductImageUpload } from "@/admin/components/ProductImageUpload";
import { SLAB_STATUS_CONFIG } from "@/lib/slab-status";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

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
