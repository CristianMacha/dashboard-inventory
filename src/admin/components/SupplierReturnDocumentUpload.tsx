import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, ExternalLink, Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  uploadSupplierReturnDocumentAction,
  getSupplierReturnDocumentUrlAction,
} from "@/admin/actions/upload-supplier-return-document.action";
import { supplierReturnKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";

interface SupplierReturnDocumentUploadProps {
  returnId: string;
  hasDocument: boolean;
}

export const SupplierReturnDocumentUpload = ({
  returnId,
  hasDocument,
}: SupplierReturnDocumentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: documentUrlData, isFetching: fetchingUrl } = useQuery({
    queryKey: [...supplierReturnKeys.detail(returnId), "document-url"],
    queryFn: () => getSupplierReturnDocumentUrlAction(returnId),
    enabled: hasDocument,
    staleTime: 55 * 60 * 1000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadSupplierReturnDocumentAction(returnId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierReturnKeys.detail(returnId) });
      void queryClient.invalidateQueries({
        queryKey: [...supplierReturnKeys.detail(returnId), "document-url"],
      });
      toast.success("Document uploaded");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err, "Failed to upload document"));
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasDocument && documentUrlData?.url && (
        <Button variant="outline" size="sm" asChild>
          <a href={documentUrlData.url} target="_blank" rel="noopener noreferrer">
            {fetchingUrl ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileText className="size-3.5" />
            )}
            View document
            <ExternalLink className="size-3" />
          </a>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileUp className="size-3.5" />
        )}
        {hasDocument ? "Replace document" : "Upload document"}
      </Button>

      <p className="text-xs text-muted-foreground">PDF or image · max 20MB</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
