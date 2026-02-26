import { apiClient } from "@/api/apiClient";
import type { BrandResponse, BrandUpdate } from "@/interfaces/brand.response";

export const updateBrandAction = async (
  id: string,
  brand: BrandUpdate,
): Promise<BrandResponse> => {
  const { data } = await apiClient.patch<BrandResponse>(`/brands/${id}`, brand);
  return data;
};
