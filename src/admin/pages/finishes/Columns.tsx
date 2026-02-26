import { Loader2, MoreHorizontal, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { FinishResponse } from "@/interfaces/finish.response";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FinishColumnsOptions {
  onEdit: (finish: FinishResponse) => void;
  onToggleActive: (finish: FinishResponse) => void;
  togglingId: string | null;
}

export const finishColumns = ({
  onEdit,
  onToggleActive,
  togglingId,
}: FinishColumnsOptions): ColumnDef<FinishResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "abbreviation",
    header: "Abbreviation",
    cell: ({ row }) =>
      row.original.abbreviation ? (
        <span className="tabular-nums font-mono text-sm">
          {row.original.abbreviation}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
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
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
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
