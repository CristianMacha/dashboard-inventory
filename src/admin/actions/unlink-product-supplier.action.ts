import { apiClient } from "@/api/apiClient";

export const unlinkProductSupplierAction = async (
  productId: string,
  productSupplierId: string,
): Promise<void> => {
  await apiClient.delete(`/products/${productId}/suppliers/${productSupplierId}`);
};
