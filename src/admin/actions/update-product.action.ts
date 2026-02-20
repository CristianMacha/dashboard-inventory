import { apiClient } from "@/api/apiClient";
import type { ProductUpdate } from "@/interfaces/product-update.action";

export const updateProductAction = async (
  id: string,
  product: ProductUpdate,
): Promise<void> => {
  await apiClient.patch<void>(`/products/${id}`, product);
};
