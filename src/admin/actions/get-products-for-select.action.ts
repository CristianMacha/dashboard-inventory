import { apiClient } from "@/api/apiClient";

export interface ProductSelectResponse {
  id: string;
  name: string;
}

export const getProductsForSelectAction = async (): Promise<ProductSelectResponse[]> => {
  const { data } = await apiClient.get<ProductSelectResponse[]>("/products/select");
  return data;
};
