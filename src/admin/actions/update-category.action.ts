import { apiClient } from "@/api/apiClient";
import type { CategoryResponse, CategoryUpdate } from "@/interfaces/category.response";

export const updateCategoryAction = async (
  id: string,
  category: CategoryUpdate,
): Promise<CategoryResponse> => {
  const { data } = await apiClient.patch<CategoryResponse>(`/categories/${id}`, category);
  return data;
};
