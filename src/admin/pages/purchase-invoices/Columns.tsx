import { Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseInvoiceResponse } from "@/interfaces/purchase-invoice.response";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { INVOICE_STATUS_CONFIG } from "@/lib/purchase-invoice-status";
import { StatusBadge } from "@/components/ui/status-badge";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const purchaseInvoiceColumns: ColumnDef<PurchaseInvoiceResponse>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.invoiceNumber}</span>
    ),
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
    size: 200,
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[200px]">
        {row.original.supplierName}
      </span>
    ),
  },
  {
    accessorKey: "invoiceDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatDate(row.original.invoiceDate)}
      </span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) =>
      row.original.dueDate ? (
        <span className="text-sm tabular-nums">
          {formatDate(row.original.dueDate)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {currency.format(row.original.totalAmount)}
      </span>
    ),
  },
  {
    accessorKey: "itemCount",
    header: "Items",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.itemCount}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { label, className } = INVOICE_STATUS_CONFIG[row.original.status];
      return <StatusBadge label={label} className={className} />;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild title="View detail">
        <Link
          to={`/purchase-invoices/${row.original.id}`}
          aria-label="View invoice detail"
        >
          <Eye className="size-4" />
        </Link>
      </Button>
    ),
  },
];
