import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Pencil, Loader2, Trash2 } from "lucide-react";

import { uploadWorkshopMaterialImageAction, deleteWorkshopMaterialImageAction } from "@/admin/actions/upload-workshop-material-image.action";
import { workshopMaterialKeys } from "@/admin/queryKeys";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ApiError } from "@/api/apiClient";

interface WorkshopMaterialImageUploadProps {
  materialId: string;
  imagePublicId: string | null;
  page: number;
  limit: number;
}

export const WorkshopMaterialImageUpload = ({
  materialId,
  imagePublicId: initialImagePublicId,
  page,
  limit,
}: WorkshopMaterialImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState(initialImagePublicId);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadWorkshopMaterialImageAction(materialId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.list({ page, limit }) });
      toast.success("Image uploaded");
    },
    onError: (err: Error) => {
      setPreviewUrl(null);
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkshopMaterialImageAction(materialId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.list({ page, limit }) });
      setImagePublicId(null);
      setPreviewUrl(null);
      toast.success("Image deleted");
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete image");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setImagePublicId(null);
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  const isPending = uploadMutation.isPending || deleteMutation.isPending;
  const displaySrc = previewUrl ?? (imagePublicId ? getCloudinaryUrl(imagePublicId, 300) : null);

  return (
    <div className="space-y-2">
      {displaySrc ? (
        <div className="relative group w-40 aspect-square rounded-md overflow-hidden border bg-muted">
          <img
            src={displaySrc}
            alt="Material image"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/50 transition-opacity ${uploadMutation.isPending || deleteMutation.isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title="Replace image"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="size-4 text-white animate-spin" />
              ) : (
                <Pencil className="size-4 text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={isPending}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title="Delete image"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 text-white animate-spin" />
              ) : (
                <Trash2 className="size-4 text-white" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
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
