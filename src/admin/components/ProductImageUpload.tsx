import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Trash2, Loader2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  uploadProductImageAction,
  deleteProductImageAction,
} from "@/admin/actions/upload-product-image.action";
import { productKeys } from "@/admin/queryKeys";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ApiError } from "@/api/apiClient";
import type { ProductImageResponse } from "@/interfaces/product.response";

const MAX_IMAGES = 5;

interface ProductImageUploadProps {
  productId: string;
  images: ProductImageResponse[];
}

export const ProductImageUpload = ({
  productId,
  images,
}: ProductImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProductImageAction(productId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.fullDetail(productId) });
      toast.success("Image uploaded");
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteProductImageAction(productId, imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.fullDetail(productId) });
      toast.success("Image deleted");
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete image");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  const canUpload = images.length < MAX_IMAGES && !uploadMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
            <img
              src={getCloudinaryUrl(img.publicId, 200)}
              alt="Product image"
              className="w-full h-full object-cover"
            />
            {img.isPrimary && (
              <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-0.5">
                <Star className="size-2.5 text-white fill-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => deleteMutation.mutate(img.id)}
              disabled={deleteMutation.isPending}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 text-white animate-spin" />
              ) : (
                <Trash2 className="size-4 text-white" />
              )}
            </button>
          </div>
        ))}

        {canUpload && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="size-5" />
                <span className="text-xs">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length}/{MAX_IMAGES} images · JPEG, PNG, WebP · max 10MB
      </p>

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
