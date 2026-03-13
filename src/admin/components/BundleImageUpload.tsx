import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Pencil, Loader2 } from "lucide-react";

import { uploadBundleImageAction } from "@/admin/actions/upload-bundle-image.action";
import { bundleKeys } from "@/admin/queryKeys";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { getErrorMessage } from "@/api/apiClient";

interface BundleImageUploadProps {
  bundleId: string;
  imagePublicId: string | null;
}

export const BundleImageUpload = ({
  bundleId,
  imagePublicId,
}: BundleImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadBundleImageAction(bundleId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bundleKeys.detail(bundleId) });
      toast.success("Image uploaded");
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err, "Failed to upload image"));
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {imagePublicId ? (
        <div className="relative group w-40 aspect-square rounded-md overflow-hidden border bg-muted">
          <img
            src={getCloudinaryUrl(imagePublicId, 300)}
            alt="Bundle image"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-4 text-white animate-spin" />
            ) : (
              <Pencil className="size-4 text-white" />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="w-40 aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="size-5" />
              <span className="text-xs">Upload image</span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP · max 10MB</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
