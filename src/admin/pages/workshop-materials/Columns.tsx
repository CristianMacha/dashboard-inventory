import { Loader2, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkshopMaterialColumnsOptions {
  onEdit: (material: WorkshopMaterialResponse) => void;
  onDelete: (material: WorkshopMaterialResponse) => void;
  deletingId: string | null;
}

export const workshopMaterialColumns = ({
  onEdit,
  onDelete,
  deletingId,
}: WorkshopMaterialColumnsOptions): ColumnDef<WorkshopMaterialResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        to={`/workshop/materials/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <span>{row.original.unit}</span>,
  },
  {
    accessorKey: "currentStock",
    header: "Stock",
    cell: ({ row }) => (
      <span className={row.original.currentStock <= row.original.minStock ? "text-destructive font-medium" : ""}>
        {row.original.currentStock}
      </span>
    ),
  },
  {
    accessorKey: "minStock",
    header: "Min. Stock",
    cell: ({ row }) => <span>{row.original.minStock}</span>,
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) =>
      row.original.unitPrice != null ? (
        <span>${row.original.unitPrice.toLocaleString()}</span>
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
              <Link to={`/workshop/materials/${row.original.id}`}>
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
