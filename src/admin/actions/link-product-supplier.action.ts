import { apiClient } from "@/api/apiClient";

export const linkProductSupplierAction = async (
  productId: string,
  supplierId: string,
): Promise<void> => {
  await apiClient.post(`/products/${productId}/suppliers`, { supplierId });
};
