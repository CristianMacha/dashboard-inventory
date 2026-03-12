import { Loader2, MoreHorizontal, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";
import { Button } from "@/components/ui/button";
import { ActiveBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkshopSupplierColumnsOptions {
  onEdit: (supplier: WorkshopSupplierResponse) => void;
  onToggleActive: (supplier: WorkshopSupplierResponse) => void;
  togglingId: string | null;
}

export const workshopSupplierColumns = ({
  onEdit,
  onToggleActive,
  togglingId,
}: WorkshopSupplierColumnsOptions): ColumnDef<WorkshopSupplierResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) =>
      row.original.phone ? (
        <span>{row.original.phone}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) =>
      row.original.email ? (
        <span>{row.original.email}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <ActiveBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const isToggling = togglingId === row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Row actions"
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreHorizontal className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(row.original)}>
              {row.original.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
