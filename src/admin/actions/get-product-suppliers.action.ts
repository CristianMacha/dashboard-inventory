import { apiClient } from "@/api/apiClient";
import type { ProductSupplierResponse } from "@/interfaces/product-supplier.response";

export const getProductSuppliersAction = async (
  productId: string,
): Promise<ProductSupplierResponse[]> => {
  const { data } = await apiClient.get<ProductSupplierResponse[]>(
    `/products/${productId}/suppliers`,
  );
  return data;
};
