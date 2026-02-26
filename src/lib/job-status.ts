import type { JobStatus } from "@/interfaces/job.response";

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "QUOTED", label: "Quoted" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; className: string }
> = {
  QUOTED: {
    label: "Quoted",
    className:
      "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-800",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
};
