import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  className: string;
}

export const StatusBadge = ({ label, className }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      className,
    )}
  >
    {label}
  </span>
);

export const ActiveBadge = ({ isActive }: { isActive: boolean }) => (
  <StatusBadge
    label={isActive ? "Active" : "Inactive"}
    className={
      isActive
        ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
        : "bg-muted text-muted-foreground"
    }
  />
);
