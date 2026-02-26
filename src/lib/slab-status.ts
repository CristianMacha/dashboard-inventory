import type { SlabStatus } from "@/interfaces/slab.response";

export const SLAB_STATUSES: { value: SlabStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
  { value: "RETURNED", label: "Returned" },
];

export const SLAB_STATUS_CONFIG: Record<
  SlabStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className:
      "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800",
  },
  RESERVED: {
    label: "Reserved",
    className:
      "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800",
  },
  SOLD: {
    label: "Sold",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
  RETURNED: {
    label: "Returned",
    className:
      "bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800",
  },
};
