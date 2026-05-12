import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PackageCheck, Send, XCircle } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryError } from "@/components/ui/query-error";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getWorkshopPurchaseOrderByIdAction } from "@/admin/actions/get-workshop-purchase-order-by-id.action";
import { updateWorkshopPurchaseOrderStatusAction } from "@/admin/actions/update-workshop-purchase-order-status.action";
import { workshopPurchaseOrderKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import { PO_STATUS_CONFIG } from "./Columns";

export const WorkshopPurchaseOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: workshopPurchaseOrderKeys.detail(id!),
    queryFn: () => getWorkshopPurchaseOrderByIdAction(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (action: "send" | "receive" | "cancel") =>
      updateWorkshopPurchaseOrderStatusAction(id!, action),
    onSuccess: (_, action) => {
      void queryClient.invalidateQueries({ queryKey: workshopPurchaseOrderKeys.detail(id!) });
      void queryClient.invalidateQueries({ queryKey: workshopPurchaseOrderKeys.lists() });
      const label = action === "send" ? "marked as sent" : action === "receive" ? "received" : "cancelled";
      toast.success(`Purchase order ${label}`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update purchase order"));
    },
  });

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/workshop/purchase-orders">Purchase Orders</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Detail</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QueryError onRetry={() => void refetch()} />
      </div>
    );
  }

  const statusCfg = data ? PO_STATUS_CONFIG[data.status] : null;
  const isPending = statusMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/workshop/purchase-orders">Purchase Orders</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading ? "…" : data?.id.slice(0, 8) + "…"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" size="sm" asChild>
          <Link to="/workshop/purchase-orders">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : data ? (
        <div className="flex flex-col gap-4">
          {/* Header info */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                {statusCfg && (
                  <StatusBadge label={statusCfg.label} className={statusCfg.className} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 text-sm pt-2">
                <div>
                  <dt className="text-muted-foreground">Order ID</dt>
                  <dd className="font-mono">{data.id.slice(0, 8)}…</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Supplier</dt>
                  <dd>{data.supplierName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total Amount</dt>
                  <dd className="font-medium">${data.totalAmount.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{new Date(data.createdAt).toLocaleDateString()}</dd>
                </div>
                {data.notes && (
                  <div className="col-span-2 sm:col-span-4">
                    <dt className="text-muted-foreground">Notes</dt>
                    <dd>{data.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Items ({data.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Material</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Requested</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Purchase Qty</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Unit Cost</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.materialId} className="border-b last:border-0">
                      <td className="px-4 py-3">{item.materialName}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{item.requestedQuantity}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.purchaseQuantity}</td>
                      <td className="px-4 py-3 text-right">${item.unitCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">${item.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Actions */}
          {(data.status === "DRAFT" || data.status === "SENT") && (
            <div className="flex gap-2 justify-end">
              {data.status === "DRAFT" && (
                <Button
                  onClick={() => statusMutation.mutate("send")}
                  disabled={isPending}
                >
                  {isPending && statusMutation.variables === "send" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Mark as Sent
                </Button>
              )}
              {data.status === "SENT" && (
                <Button
                  onClick={() => statusMutation.mutate("receive")}
                  disabled={isPending}
                >
                  {isPending && statusMutation.variables === "receive" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PackageCheck className="size-4" />
                  )}
                  Mark as Received
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => statusMutation.mutate("cancel")}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                {isPending && statusMutation.variables === "cancel" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
