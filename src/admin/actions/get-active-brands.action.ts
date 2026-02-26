import { apiClient } from "@/api/apiClient";
import type { BrandResponse } from "@/interfaces/brand.response";

export const getActiveBrandsAction = async (): Promise<BrandResponse[]> => {
  const { data } = await apiClient.get<BrandResponse[]>("/brands/active");
  return data;
};
