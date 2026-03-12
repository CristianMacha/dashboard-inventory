import { Loader2, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkshopToolResponse, WorkshopToolStatus } from "@/interfaces/workshop-tool.response";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS: Record<WorkshopToolStatus, string> = {
  available: "Available",
  in_use: "In Use",
  in_repair: "In Repair",
  retired: "Retired",
};

const STATUS_VARIANTS: Record<WorkshopToolStatus, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  in_use: "secondary",
  in_repair: "outline",
  retired: "destructive",
};

interface WorkshopToolColumnsOptions {
  onEdit: (tool: WorkshopToolResponse) => void;
  onDelete: (tool: WorkshopToolResponse) => void;
  deletingId: string | null;
}

export const workshopToolColumns = ({
  onEdit,
  onDelete,
  deletingId,
}: WorkshopToolColumnsOptions): ColumnDef<WorkshopToolResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        to={`/workshop/tools/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) =>
      row.original.description ? (
        <span className="text-muted-foreground truncate max-w-xs block">
          {row.original.description}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANTS[row.original.status]}>
        {STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "purchasePrice",
    header: "Purchase Price",
    cell: ({ row }) =>
      row.original.purchasePrice != null ? (
        <span>${row.original.purchasePrice.toLocaleString()}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const isDeleting = deletingId === row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Row actions"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreHorizontal className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/workshop/tools/${row.original.id}`}>
                <Eye className="size-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
