import { apiClient } from "@/api/apiClient";
import type { CategoryResponse } from "@/interfaces/category.response";

export const getCategoriesAction = async (): Promise<CategoryResponse[]> => {
  const { data } = await apiClient.get<CategoryResponse[]>("/categories/active");
  return data;
};
