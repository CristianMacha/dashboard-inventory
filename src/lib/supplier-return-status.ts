import type { SupplierReturnStatus } from "@/interfaces/supplier-return.response";

export const RETURN_STATUSES: { value: SupplierReturnStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "CREDITED", label: "Credited" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const RETURN_STATUS_CONFIG: Record<
  SupplierReturnStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-800",
  },
  SENT: {
    label: "Sent",
    className:
      "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800",
  },
  CREDITED: {
    label: "Credited",
    className:
      "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
};
