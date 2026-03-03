import { Eye, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import type { BundleResponse } from "@/interfaces/bundle.response";
import { Button } from "@/components/ui/button";

export const bundleColumns = (
  onEdit: (bundle: BundleResponse) => void,
): ColumnDef<BundleResponse>[] => [
  {
    accessorKey: "lotNumber",
    header: "Lot Number",
    cell: ({ row }) =>
      row.original.lotNumber ? (
        <span className="font-medium">{row.original.lotNumber}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.productName}</span>
    ),
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.supplierName}</span>
    ),
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) =>
      row.original.invoiceNumber ? (
        <span className="tabular-nums text-sm">{row.original.invoiceNumber}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "thicknessCm",
    header: "Thickness",
    cell: ({ row }) =>
      row.original.thicknessCm != null ? (
        <span className="tabular-nums">{row.original.thicknessCm} cm</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild aria-label="View bundle">
          <Link to={`/bundles/${row.original.id}`}>
            <Eye className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original)}
          aria-label="Edit bundle"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    ),
  },
];
