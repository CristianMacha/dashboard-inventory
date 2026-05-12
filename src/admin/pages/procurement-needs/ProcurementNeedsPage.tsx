import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { AlertTriangle, Package, ShoppingCart, Wrench } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { QueryError } from "@/components/ui/query-error";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getProcurementNeedsAction } from "@/admin/actions/get-procurement-needs.action";
import { procurementNeedsKeys } from "@/admin/queryKeys";
import type {
  MaterialBelowMinStockDto,
  ApprovedRequestStockGapDto,
  ToolInRepairDto,
  UnfulfilledRequestDto,
} from "@/interfaces/workshop-request.response";
import type { CreatePurchaseOrderItemBody } from "@/interfaces/workshop-purchase-order.response";
import { CreatePurchaseOrderSheet } from "@/admin/pages/workshop-purchase-orders/components/CreatePurchaseOrderSheet";

const SectionSkeleton = () => (
  <div className="flex flex-col gap-2">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-14 w-full rounded-lg" />
    ))}
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <p className="text-sm text-muted-foreground py-4 text-center">{message}</p>
);

const MaterialBelowMinRow = ({ item }: { item: MaterialBelowMinStockDto }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium">{item.materialName}</span>
      <span className="text-xs text-muted-foreground">
        Stock: {item.currentStock} {item.unit} · Min: {item.minStock} {item.unit}
      </span>
    </div>
    <StatusBadge
      label={`-${item.deficit} ${item.unit}`}
      className="bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
    />
  </div>
);

const UnfulfilledRequestRow = ({ req, unit }: { req: UnfulfilledRequestDto; unit: string }) => (
  <div className="flex items-center justify-between py-2 pl-3 border-l-2 border-muted">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">
        Requested: {req.requestedQuantity} {unit}
        {req.approvedQuantity !== req.requestedQuantity && (
          <> · Approved: {req.approvedQuantity} {unit}</>
        )}
        {" · "}Available: {req.availableStock} {unit}
      </span>
      <span className="text-xs text-muted-foreground">By {req.requestedByName}</span>
    </div>
    <div className="flex items-center gap-2">
      {req.priority === "urgent" && (
        <StatusBadge
          label="Urgent"
          className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400"
        />
      )}
      <StatusBadge
        label={`-${req.shortfall} ${unit}`}
        className="bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
      />
    </div>
  </div>
);

const StockGapRow = ({
  item,
  checked,
  onCheckedChange,
}: {
  item: ApprovedRequestStockGapDto;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex flex-col gap-1 py-3 border-b last:border-0">
    <div className="flex items-center gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(!!v)}
        id={`gap-${item.materialId}`}
      />
      <label
        htmlFor={`gap-${item.materialId}`}
        className="flex flex-1 items-center justify-between gap-2 cursor-pointer"
      >
        <span className="text-sm font-medium">{item.materialName}</span>
        <StatusBadge
          label={`-${item.totalShortfall} ${item.unit}`}
          className="bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 shrink-0"
        />
      </label>
    </div>
    <div className="flex flex-col gap-1 mt-1 pl-7">
      {item.unfulfilledRequests.map((req) => (
        <UnfulfilledRequestRow key={req.requestId} req={req} unit={item.unit} />
      ))}
    </div>
  </div>
);

const ToolInRepairRow = ({ item }: { item: ToolInRepairDto }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <span className="text-sm font-medium">{item.toolName}</span>
    <StatusBadge
      label="In Repair"
      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
    />
  </div>
);

export const ProcurementNeedsPage = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefillItems, setPrefillItems] = useState<CreatePurchaseOrderItemBody[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: procurementNeedsKeys.all,
    queryFn: getProcurementNeedsAction,
  });

  const gaps = data?.approvedRequestsWithInsufficientStock ?? [];

  const toggleSelected = (materialId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(materialId); else next.delete(materialId);
      return next;
    });
  };

  const allChecked = gaps.length > 0 && selectedIds.size === gaps.length;
  const someChecked = selectedIds.size > 0 && !allChecked;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(gaps.map((g) => g.materialId)) : new Set());
  };

  const openOrderSheet = () => {
    const items = gaps
      .filter((g) => selectedIds.has(g.materialId))
      .map((g) => ({
        materialId: g.materialId,
        materialName: g.materialName,
        purchaseQuantity: g.totalShortfall,
        requestedQuantity: g.totalShortfall,
        unitCost: 0,
      }));
    setPrefillItems(items);
    setSheetOpen(true);
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Procurement Needs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QueryError onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Procurement Needs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-red-500" />
              <CardTitle>Materials Below Min. Stock</CardTitle>
            </div>
            <CardDescription>
              Materials whose current stock is under the minimum threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SectionSkeleton />
            ) : data?.materialsBelowMinStock.length === 0 ? (
              <EmptyState message="All materials are above minimum stock." />
            ) : (
              data?.materialsBelowMinStock.map((item) => (
                <MaterialBelowMinRow key={item.materialId} item={item} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              <CardTitle>Approved Requests with Stock Gap</CardTitle>
            </div>
            <CardDescription>
              Select one or more materials to create a purchase order.
            </CardDescription>
            <CardAction>
              {!isLoading && gaps.length > 0 && (
                <Button
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={openOrderSheet}
                >
                  <ShoppingCart className="size-4" />
                  Order{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SectionSkeleton />
            ) : gaps.length === 0 ? (
              <EmptyState message="No stock gaps for approved requests." />
            ) : (
              <>
                <div className="flex items-center gap-3 py-2 border-b">
                  <Checkbox
                    checked={allChecked}
                    data-state={someChecked ? "indeterminate" : undefined}
                    onCheckedChange={toggleAll}
                    id="gap-select-all"
                  />
                  <label
                    htmlFor="gap-select-all"
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                  >
                    {allChecked ? "Deselect all" : "Select all"}
                  </label>
                </div>
                {gaps.map((item) => (
                  <StockGapRow
                    key={item.materialId}
                    item={item}
                    checked={selectedIds.has(item.materialId)}
                    onCheckedChange={(v) => toggleSelected(item.materialId, v)}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-yellow-500" />
              <CardTitle>Tools in Repair</CardTitle>
            </div>
            <CardDescription>
              Tools currently marked as in repair and unavailable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SectionSkeleton />
            ) : data?.toolsInRepair.length === 0 ? (
              <EmptyState message="No tools currently in repair." />
            ) : (
              data?.toolsInRepair.map((item) => (
                <ToolInRepairRow key={item.toolId} item={item} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <CreatePurchaseOrderSheet
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) {
            setPrefillItems([]);
            setSelectedIds(new Set());
          }
        }}
        initialItems={prefillItems}
      />
    </div>
  );
};
