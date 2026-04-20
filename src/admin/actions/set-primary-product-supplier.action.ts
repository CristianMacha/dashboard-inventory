import { apiClient } from "@/api/apiClient";

export const setPrimaryProductSupplierAction = async (
  productId: string,
  productSupplierId: string,
): Promise<void> => {
  await apiClient.patch(
    `/products/${productId}/suppliers/${productSupplierId}/set-primary`,
  );
};
