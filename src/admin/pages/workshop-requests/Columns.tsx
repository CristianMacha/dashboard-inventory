import { Loader2, MoreHorizontal, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkshopRequestDto } from "@/interfaces/workshop-request.response";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";

// eslint-disable-next-line react-refresh/only-export-components
const QtyCell = ({ quantity, approvedQuantity }: { quantity: number | null; approvedQuantity: number | null }) => {
  if (quantity == null) return <span className="text-muted-foreground">—</span>;
  if (approvedQuantity != null && approvedQuantity !== quantity) {
    return (
      <span className="flex flex-col leading-tight">
        <span className="line-through text-muted-foreground text-xs">{quantity}</span>
        <span>{approvedQuantity}</span>
      </span>
    );
  }
  return <span>{quantity}</span>;
};

const STATUS_CONFIG: Record<
  WorkshopRequestDto["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  },
  delivered: {
    label: "Delivered",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  },
};

const PRIORITY_CONFIG: Record<
  WorkshopRequestDto["priority"],
  { label: string; className: string }
> = {
  normal: {
    label: "Normal",
    className: "bg-muted text-muted-foreground",
  },
  urgent: {
    label: "Urgent",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  },
};

interface WorkshopRequestColumnsOptions {
  onApprove: (request: WorkshopRequestDto) => void;
  onReject: (request: WorkshopRequestDto) => void;
  onDeliver: (request: WorkshopRequestDto) => void;
  approvingId: string | null;
  rejectingId: string | null;
  deliveringId: string | null;
}

export const workshopRequestColumns = ({
  onApprove,
  onReject,
  onDeliver,
  approvingId,
  rejectingId,
  deliveringId,
}: WorkshopRequestColumnsOptions): ColumnDef<WorkshopRequestDto>[] => [
  {
    accessorKey: "requestType",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.requestType}</span>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Item",
    cell: ({ row }) => <span>{row.original.itemName}</span>,
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <QtyCell quantity={row.original.quantity} approvedQuantity={row.original.approvedQuantity} />
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const cfg = PRIORITY_CONFIG[row.original.priority];
      return <StatusBadge label={cfg.label} className={cfg.className} />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status];
      return <StatusBadge label={cfg.label} className={cfg.className} />;
    },
  },
  {
    accessorKey: "requestedByName",
    header: "Requested By",
    cell: ({ row }) => <span>{row.original.requestedByName}</span>,
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
      const request = row.original;
      const isApproving = approvingId === request.id;
      const isRejecting = rejectingId === request.id;
      const isDelivering = deliveringId === request.id;
      const isBusy = isApproving || isRejecting || isDelivering;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Row actions"
              disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreHorizontal className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {request.status === "pending" ? (
              <>
                <DropdownMenuItem onClick={() => onApprove(request)}>
                  <CheckCircle className="size-4 text-green-600" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onReject(request)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="size-4" />
                  Reject
                </DropdownMenuItem>
              </>
            ) : request.status === "approved" ? (
              <DropdownMenuItem onClick={() => onDeliver(request)}>
                <PackageCheck className="size-4 text-blue-600" />
                Mark as Delivered
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                {STATUS_CONFIG[request.status].label}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const workshopRequestReadOnlyColumns = (): ColumnDef<WorkshopRequestDto>[] => [
  {
    accessorKey: "requestType",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.requestType}</span>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Item",
    cell: ({ row }) => <span>{row.original.itemName}</span>,
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <QtyCell quantity={row.original.quantity} approvedQuantity={row.original.approvedQuantity} />
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const cfg = PRIORITY_CONFIG[row.original.priority];
      return <StatusBadge label={cfg.label} className={cfg.className} />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status];
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
];
