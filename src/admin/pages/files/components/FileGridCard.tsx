import { useQuery } from "@tanstack/react-query";
import { Download, Eye, File, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFileUrlAction } from "@/admin/actions/get-file-url.action";
import { fileKeys } from "@/admin/queryKeys";
import type { FileRecordDto } from "@/interfaces/file.response";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function GridFileThumbnail({
  file,
  organizationId,
}: {
  file: FileRecordDto;
  organizationId: string;
}) {
  const isImage = file.mimeType.startsWith("image/");

  const { data: signedUrl } = useQuery({
    queryKey: fileKeys.fileUrl(file.id, organizationId),
    queryFn: () => getFileUrlAction(file.id, organizationId),
    enabled: isImage && !!organizationId,
    staleTime: 50 * 60 * 1000,
  });

  if (isImage && signedUrl) {
    return <img src={signedUrl} alt={file.name} className="size-full object-cover" />;
  }

  return (
    <div className="flex size-full items-center justify-center bg-muted">
      <File className="size-10 text-blue-400 opacity-60" />
    </div>
  );
}

interface FileGridCardProps {
  file: FileRecordDto;
  organizationId: string;
  onPreview: () => void;
  onTags?: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  downloading: boolean;
  deleting?: boolean;
}

export const FileGridCard = ({
  file,
  organizationId,
  onPreview,
  onTags,
  onDownload,
  onDelete,
  downloading,
  deleting = false,
}: FileGridCardProps) => (
  <div className="group relative flex flex-col rounded-lg border overflow-hidden hover:border-primary/50 transition-colors">
    <div className="aspect-square overflow-hidden">
      <GridFileThumbnail file={file} organizationId={organizationId} />
    </div>
    <div className="p-2 border-t">
      <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
      <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</p>
      {file.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {file.tags.slice(0, 3).map((t) => (
            <span key={t} className="inline-block bg-secondary text-secondary-foreground rounded px-1 text-[10px]">
              {t}
            </span>
          ))}
          {file.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{file.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
      <Button
        variant="ghost" size="icon"
        className="size-8 text-white hover:text-white hover:bg-white/20"
        onClick={onPreview} title="Preview"
      >
        <Eye className="size-4" />
      </Button>
      {onTags && (
        <Button
          variant="ghost" size="icon"
          className="size-8 text-white hover:text-white hover:bg-white/20"
          onClick={onTags} title="Manage tags"
        >
          <Tag className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost" size="icon"
        className="size-8 text-white hover:text-white hover:bg-white/20"
        onClick={onDownload} disabled={downloading} title="Download"
      >
        <Download className="size-4" />
      </Button>
      {onDelete && (
        <Button
          variant="ghost" size="icon"
          className="size-8 text-white hover:text-white hover:bg-red-500/40"
          onClick={onDelete} disabled={deleting} title="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  </div>
);
