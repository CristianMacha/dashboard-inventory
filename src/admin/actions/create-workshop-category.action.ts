import { apiClient } from "@/api/apiClient";
import type { WorkshopCategoryCreate, WorkshopCategoryResponse } from "@/interfaces/workshop-category.response";

export const createWorkshopCategoryAction = async (
  category: WorkshopCategoryCreate,
): Promise<WorkshopCategoryResponse> => {
  const { data } = await apiClient.post<WorkshopCategoryResponse>("/workshop/categories", category);
  return data;
};
