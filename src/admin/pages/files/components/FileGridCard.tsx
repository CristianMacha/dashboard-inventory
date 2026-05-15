import { useQuery } from "@tanstack/react-query";
import { Download, Eye, File, FolderInput, MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onRename?: () => void;
  onTags?: () => void;
  onMove?: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  downloading: boolean;
  deleting?: boolean;
}

export const FileGridCard = ({
  file,
  organizationId,
  onPreview,
  onRename,
  onTags,
  onMove,
  onDownload,
  onDelete,
  downloading,
  deleting = false,
}: FileGridCardProps) => (
  <div className="group relative flex flex-col rounded-lg border overflow-hidden hover:border-primary/50 transition-colors">
    <button className="aspect-square overflow-hidden w-full" onClick={onPreview}>
      <GridFileThumbnail file={file} organizationId={organizationId} />
    </button>
    <div className="p-2 border-t">
      <p className="text-xs font-medium truncate pr-6" title={file.name}>{file.name}</p>
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
    <div className="absolute bottom-[34px] right-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 bg-background/80 hover:bg-background transition-opacity"
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPreview}>
            <Eye className="size-4" /> Preview
          </DropdownMenuItem>
          {onRename && (
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="size-4" /> Rename
            </DropdownMenuItem>
          )}
          {onTags && (
            <DropdownMenuItem onClick={onTags}>
              <Tag className="size-4" /> Tags
            </DropdownMenuItem>
          )}
          {onMove && (
            <DropdownMenuItem onClick={onMove}>
              <FolderInput className="size-4" /> Move
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onDownload} disabled={downloading}>
            <Download className="size-4" /> Download
          </DropdownMenuItem>
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} disabled={deleting} className="text-destructive focus:text-destructive">
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);
