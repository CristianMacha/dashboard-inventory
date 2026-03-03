import { Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { SupplierReturnResponse } from "@/interfaces/supplier-return.response";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { RETURN_STATUS_CONFIG } from "@/lib/supplier-return-status";
import { StatusBadge } from "@/components/ui/status-badge";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const supplierReturnColumns: ColumnDef<SupplierReturnResponse>[] = [
  {
    id: "supplierName",
    accessorKey: "supplierName",
    header: "Supplier",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.supplierName}</span>
    ),
  },
  {
    id: "invoiceNumber",
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.invoiceNumber}</span>
    ),
  },
  {
    id: "returnDate",
    accessorKey: "returnDate",
    header: "Return Date",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatDate(row.original.returnDate)}</span>
    ),
  },
  {
    id: "creditAmount",
    accessorKey: "creditAmount",
    header: "Credit",
    cell: ({ row }) =>
      row.original.creditAmount > 0 ? (
        <span className="tabular-nums text-sm font-medium">
          {currency.format(row.original.creditAmount)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { label, className } = RETURN_STATUS_CONFIG[row.original.status];
      return <StatusBadge label={label} className={className} />;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild title="View detail">
        <Link
          to={`/purchasing/supplier-returns/${row.original.id}`}
          aria-label="View supplier return detail"
        >
          <Eye className="size-4" />
        </Link>
      </Button>
    ),
  },
];
