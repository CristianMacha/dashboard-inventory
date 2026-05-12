import { Loader2, MoreHorizontal, Send, PackageCheck, XCircle, Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkshopPurchaseOrderDto } from "@/interfaces/workshop-purchase-order.response";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";

export const PO_STATUS_CONFIG: Record<
  WorkshopPurchaseOrderDto["status"],
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  SENT: {
    label: "Sent",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  },
  RECEIVED: {
    label: "Received",
    className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  },
};

interface WorkshopPurchaseOrderColumnsOptions {
  onSend: (order: WorkshopPurchaseOrderDto) => void;
  onReceive: (order: WorkshopPurchaseOrderDto) => void;
  onCancel: (order: WorkshopPurchaseOrderDto) => void;
  pendingId: string | null;
}

export const workshopPurchaseOrderColumns = ({
  onSend,
  onReceive,
  onCancel,
  pendingId,
}: WorkshopPurchaseOrderColumnsOptions): ColumnDef<WorkshopPurchaseOrderDto>[] => [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => (
      <Link
        to={`/workshop/purchase-orders/${row.original.id}`}
        className="font-mono text-xs hover:underline"
      >
        {row.original.id.slice(0, 8)}…
      </Link>
    ),
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
    cell: ({ row }) => <span>{row.original.supplierName}</span>,
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => <span>{row.original.items.length}</span>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span>${row.original.totalAmount.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = PO_STATUS_CONFIG[row.original.status];
      return <StatusBadge label={cfg.label} className={cfg.className} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const order = row.original;
      const isBusy = pendingId === order.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions" disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreHorizontal className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/workshop/purchase-orders/${order.id}`}>
                <Eye className="size-4" />
                View
              </Link>
            </DropdownMenuItem>
            {order.status === "DRAFT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSend(order)}>
                  <Send className="size-4" />
                  Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="size-4" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
            {order.status === "SENT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onReceive(order)}>
                  <PackageCheck className="size-4" />
                  Mark as Received
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="size-4" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
