import { Eye } from "lucide-react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { JobResponse } from "@/interfaces/job.response";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { JOB_STATUS_CONFIG } from "@/lib/job-status";
import { StatusBadge } from "@/components/ui/status-badge";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const jobColumns: ColumnDef<JobResponse>[] = [
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium truncate">{row.original.projectName}</p>
        {row.original.notes && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {row.original.notes}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm">{row.original.clientName}</p>
        {row.original.clientPhone && (
          <p className="text-xs text-muted-foreground">
            {row.original.clientPhone}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "scheduledDate",
    header: "Scheduled",
    cell: ({ row }) =>
      row.original.scheduledDate ? (
        <span className="text-sm tabular-nums">
          {formatDate(row.original.scheduledDate)}
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
    header: "Slabs",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.original.itemCount}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { label, className } = JOB_STATUS_CONFIG[row.original.status];
      return <StatusBadge label={label} className={className} />;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild title="View detail">
        <Link to={`/jobs/${row.original.id}`} aria-label="View job detail">
          <Eye className="size-4" />
        </Link>
      </Button>
    ),
  },
];
