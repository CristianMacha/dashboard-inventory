import type { OrganizationDto } from "@/interfaces/file.response";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface StorageUsageBarProps {
  org: OrganizationDto;
}

export const StorageUsageBar = ({ org }: StorageUsageBarProps) => {
  const pct = org.storageLimitBytes > 0
    ? Math.min((org.storageUsedBytes / org.storageLimitBytes) * 100, 100)
    : 0;

  const color =
    pct >= 90 ? "bg-destructive" :
    pct >= 70 ? "bg-amber-500" :
    "bg-primary";

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex-1 min-w-[120px] max-w-[200px]">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatBytes(org.storageUsedBytes)} / {formatBytes(org.storageLimitBytes)}
      </span>
    </div>
  );
};
