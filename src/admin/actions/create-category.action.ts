import { apiClient } from "@/api/apiClient";
import type { CategoryCreate, CategoryResponse } from "@/interfaces/category.response";

export const createCategoryAction = async (
  category: CategoryCreate,
): Promise<CategoryResponse> => {
  const { data } = await apiClient.post<CategoryResponse>("/categories", category);
  return data;
};
