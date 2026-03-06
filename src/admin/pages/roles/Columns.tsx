import { Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { RoleResponse } from "@/interfaces/user.response";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const roleColumns = (
  onEdit: (role: RoleResponse) => void,
): ColumnDef<RoleResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <p className="font-medium">{row.original.name}</p>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const perms = row.original.permissions;
      if (!perms.length) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {perms.slice(0, 5).map((p) => (
            <Badge key={p.id} variant="outline" className="text-xs font-normal">
              {p.description ?? p.name}
            </Badge>
          ))}
          {perms.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{perms.length - 5} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(row.original)}
        aria-label="Edit role"
      >
        <Pencil className="size-4" />
      </Button>
    ),
  },
];
