import { apiClient } from "@/api/apiClient";

export const uploadProductImageAction = async (
  productId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProductImageAction = async (
  productId: string,
  imageId: string,
): Promise<void> => {
  await apiClient.delete(`/products/${productId}/images/${imageId}`);
};
