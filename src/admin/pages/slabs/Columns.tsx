import { Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SlabResponse } from "@/interfaces/slab.response";
import { Button } from "@/components/ui/button";
import { SLAB_STATUS_CONFIG } from "@/lib/slab-status";
import { StatusBadge } from "@/components/ui/status-badge";

export const slabColumns = (
  onEdit: (slab: SlabResponse) => void,
): ColumnDef<SlabResponse>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
  },
  {
    accessorKey: "dimensions",
    header: "Dimensions",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.dimensions} cm</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const { label, className } = SLAB_STATUS_CONFIG[status];
      return <StatusBadge label={label} className={className} />;
    },
  },
  {
    accessorKey: "bundleId",
    header: "Bundle",
    cell: ({ row }) => (
      <code className="bg-muted rounded px-1.5 py-0.5 text-xs text-muted-foreground">
        {row.original.bundleId.slice(0, 8)}&hellip;
      </code>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) =>
      row.original.description ? (
        <span className="text-sm line-clamp-1">{row.original.description}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(row.original)}
        aria-label="Edit slab"
      >
        <Pencil className="size-4" />
      </Button>
    ),
  },
];
