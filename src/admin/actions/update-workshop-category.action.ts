import { apiClient } from "@/api/apiClient";
import type { WorkshopCategoryUpdate, WorkshopCategoryResponse } from "@/interfaces/workshop-category.response";

export const updateWorkshopCategoryAction = async (
  id: string,
  category: WorkshopCategoryUpdate,
): Promise<WorkshopCategoryResponse> => {
  const { data } = await apiClient.patch<WorkshopCategoryResponse>(`/workshop/categories/${id}`, category);
  return data;
};
