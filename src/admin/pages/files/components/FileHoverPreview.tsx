import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { getFileUrlAction } from "@/admin/actions/get-file-url.action";
import { fileKeys } from "@/admin/queryKeys";
import type { FileRecordDto } from "@/interfaces/file.response";

interface FileHoverPreviewProps {
  file: FileRecordDto;
  organizationId: string;
  children: React.ReactNode;
}

function getPreviewType(mimeType: string): "image" | "pdf" | "none" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "none";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileHoverPreview = ({
  file,
  organizationId,
  children,
}: FileHoverPreviewProps) => {
  const previewType = getPreviewType(file.mimeType);
  const canPreview = previewType !== "none";

  const { data: signedUrl, isLoading } = useQuery({
    queryKey: fileKeys.fileUrl(file.id, organizationId),
    queryFn: () => getFileUrlAction(file.id, organizationId),
    enabled: !!organizationId && canPreview,
    staleTime: 50 * 60 * 1000,
  });

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-72 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : canPreview && signedUrl ? (
          previewType === "image" ? (
            <img
              src={signedUrl}
              alt={file.name}
              className="w-full max-h-60 object-contain rounded"
            />
          ) : (
            <iframe
              src={`${signedUrl}#toolbar=0&view=FitH`}
              title={file.name}
              className="w-full rounded border"
              style={{ height: "240px" }}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 h-24 text-muted-foreground">
            <FileText className="size-8 opacity-40" />
            <p className="text-xs">No preview available</p>
          </div>
        )}
        <div className="mt-2 px-1">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {file.mimeType} · {formatBytes(file.sizeBytes)}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
