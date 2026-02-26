import type { PurchaseInvoiceStatus } from "@/interfaces/purchase-invoice.response";

export const INVOICE_STATUSES: {
  value: PurchaseInvoiceStatus;
  label: string;
}[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "RECEIVED", label: "Received" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const INVOICE_STATUS_CONFIG: Record<
  PurchaseInvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-800",
  },
  RECEIVED: {
    label: "Received",
    className:
      "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    className:
      "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800",
  },
  PAID: {
    label: "Paid",
    className:
      "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
};
