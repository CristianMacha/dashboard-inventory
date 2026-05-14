import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getFileUrlAction } from "@/admin/actions/get-file-url.action";
import { fileKeys } from "@/admin/queryKeys";
import type { FileRecordDto } from "@/interfaces/file.response";

interface FilePreviewDialogProps {
  file: FileRecordDto | null;
  organizationId: string;
  onOpenChange: (open: boolean) => void;
}

function getPreviewType(mimeType: string): "image" | "pdf" | "none" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "none";
}

export const FilePreviewDialog = ({
  file,
  organizationId,
  onOpenChange,
}: FilePreviewDialogProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const previewType = file ? getPreviewType(file.mimeType) : "none";
  const canPreview = previewType !== "none";

  const { data: signedUrl, isLoading } = useQuery({
    queryKey: fileKeys.fileUrl(file?.id ?? "", organizationId),
    queryFn: () => getFileUrlAction(file!.id, organizationId),
    enabled: !!file && !!organizationId && canPreview,
    staleTime: 50 * 60 * 1000, // signed URL valid for 1h, refresh at 50min
  });

  // For images, fetch as blob to avoid CORS issues with the signed URL in <img>
  useEffect(() => {
    if (previewType !== "image" || !signedUrl) return;
    let revoked = false;
    fetch(signedUrl)
      .then((r) => r.blob())
      .then((blob) => {
        if (!revoked) setObjectUrl(URL.createObjectURL(blob));
      })
      .catch(() => setObjectUrl(signedUrl)); // fallback: use URL directly
    return () => {
      revoked = true;
      setObjectUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [signedUrl, previewType]);

  const handleOpenChange = (open: boolean) => {
    if (!open) setObjectUrl(null);
    onOpenChange(open);
  };

  return (
    <Dialog open={!!file} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !canPreview ? (
            <div className="flex flex-col items-center justify-center gap-3 h-40 text-muted-foreground">
              <p className="text-sm">Preview not available for <strong>{file?.mimeType}</strong>.</p>
              <Button onClick={() => signedUrl && window.open(signedUrl, "_blank")}>
                <Download className="size-4" />
                Download file
              </Button>
            </div>
          ) : previewType === "image" ? (
            <img
              src={objectUrl ?? signedUrl}
              alt={file?.name}
              className="max-h-[70vh] w-full object-contain rounded"
            />
          ) : (
            <iframe
              src={signedUrl}
              title={file?.name}
              className="w-full rounded border"
              style={{ height: "70vh" }}
            />
          )}

          {canPreview && signedUrl && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.open(signedUrl, "_blank")}>
                <Download className="size-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
