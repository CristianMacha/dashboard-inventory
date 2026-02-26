import { apiClient } from "@/api/apiClient";
import type { BrandCreate, BrandResponse } from "@/interfaces/brand.response";

export const createBrandAction = async (
  brand: BrandCreate,
): Promise<BrandResponse> => {
  const { data } = await apiClient.post<BrandResponse>("/brands", brand);
  return data;
};
