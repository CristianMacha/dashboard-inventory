import { apiClient } from "@/api/apiClient";
import type { ProductDetailResponse } from "@/interfaces/product.response";

export const getProductDetailAction = async (
  id: string,
): Promise<ProductDetailResponse> => {
  if (!id) throw new Error("Product ID is required");
  const { data } = await apiClient.get<ProductDetailResponse>(
    `/products/${id}/detail`,
  );
  return data;
};
