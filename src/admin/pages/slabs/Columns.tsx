import { Pencil, Scissors, MoreHorizontal, ShieldCheck, DollarSign, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SlabResponse, SlabStatus } from "@/interfaces/slab.response";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SLAB_STATUS_CONFIG } from "@/lib/slab-status";
import { StatusBadge } from "@/components/ui/status-badge";

const TRANSITIONS: Record<
  SlabStatus,
  { action: "reserve" | "sell" | "returning"; label: string; icon: React.ElementType }[]
> = {
  AVAILABLE: [
    { action: "reserve", label: "Reserve", icon: ShieldCheck },
    { action: "sell", label: "Mark as Sold", icon: DollarSign },
    { action: "returning", label: "Mark as Returning", icon: RotateCcw },
  ],
  RESERVED: [
    { action: "sell", label: "Mark as Sold", icon: DollarSign },
    { action: "returning", label: "Mark as Returning", icon: RotateCcw },
  ],
  SOLD: [],
  RETURNING: [],
  RETURNED: [],
};

export const slabColumns = (
  onEdit: (slab: SlabResponse) => void,
  onStatusAction: (
    slab: SlabResponse,
    action: "reserve" | "sell" | "returning",
  ) => void,
): ColumnDef<SlabResponse>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.code}</span>
        {row.original.isRemnant && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-800">
            <Scissors className="size-3" />
            Remnant
          </span>
        )}
      </div>
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
    cell: ({ row }) => {
      const slab = row.original;
      const transitions = TRANSITIONS[slab.status];

      return (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(slab)}
            aria-label="Edit slab"
          >
            <Pencil className="size-4" />
          </Button>

          {transitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSeparator className="first:hidden" />
                {transitions.map(({ action, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={action}
                    onClick={() => onStatusAction(slab, action)}
                  >
                    <Icon className="size-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
  },
];
