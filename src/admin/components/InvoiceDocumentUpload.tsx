import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp, ExternalLink, Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  uploadInvoiceDocumentAction,
  getInvoiceDocumentUrlAction,
} from "@/admin/actions/upload-invoice-document.action";
import { purchaseInvoiceKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";

interface InvoiceDocumentUploadProps {
  invoiceId: string;
  hasDocument: boolean;
}

export const InvoiceDocumentUpload = ({
  invoiceId,
  hasDocument,
}: InvoiceDocumentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: documentUrlData, isFetching: fetchingUrl } = useQuery({
    queryKey: [...purchaseInvoiceKeys.detail(invoiceId), "document-url"],
    queryFn: () => getInvoiceDocumentUrlAction(invoiceId),
    enabled: hasDocument,
    staleTime: 55 * 60 * 1000, // URLs valid 1h, refresh at 55min
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadInvoiceDocumentAction(invoiceId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(invoiceId) });
      void queryClient.invalidateQueries({
        queryKey: [...purchaseInvoiceKeys.detail(invoiceId), "document-url"],
      });
      toast.success("Document uploaded");
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload document");
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
