import { Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserResponse } from "@/interfaces/user.response";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const userColumns = (
  onEdit: (user: UserResponse) => void,
): ColumnDef<UserResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles;
      if (!roles.length) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary" className="text-xs">
              {role.name}
            </Badge>
          ))}
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
        aria-label="Edit user"
      >
        <Pencil className="size-4" />
      </Button>
    ),
  },
];
