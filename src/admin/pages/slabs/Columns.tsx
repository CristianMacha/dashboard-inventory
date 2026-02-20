import { Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SlabResponse, SlabStatus } from "@/interfaces/slab.response";
import { Button } from "@/components/ui/button";

export const SLAB_STATUSES: { value: SlabStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
];

const statusStyles: Record<SlabStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 ring-green-200",
  RESERVED: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  SOLD: "bg-red-100 text-red-800 ring-red-200",
};

const pillClasses =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1";

export const slabColumns = (
  onEdit: (slab: SlabResponse) => void,
): ColumnDef<SlabResponse>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.code}</span>
    ),
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
      const label =
        SLAB_STATUSES.find((s) => s.value === status)?.label ?? status;
      return (
        <span className={`${pillClasses} ${statusStyles[status]}`}>
          {label}
        </span>
      );
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
