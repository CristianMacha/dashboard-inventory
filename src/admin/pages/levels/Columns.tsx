import { Loader2, MoreHorizontal, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LevelResponse } from "@/interfaces/level.response";
import { Button } from "@/components/ui/button";
import { ActiveBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LevelColumnsOptions {
  onEdit: (level: LevelResponse) => void;
  onToggleActive: (level: LevelResponse) => void;
  togglingId: string | null;
}

export const levelColumns = ({
  onEdit,
  onToggleActive,
  togglingId,
}: LevelColumnsOptions): ColumnDef<LevelResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "sortOrder",
    header: "Sort Order",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.sortOrder}</span>
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
