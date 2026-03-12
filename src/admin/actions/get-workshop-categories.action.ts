import { apiClient } from "@/api/apiClient";
import type { WorkshopCategoryResponse } from "@/interfaces/workshop-category.response";

export const getWorkshopCategoriesAction = async (): Promise<WorkshopCategoryResponse[]> => {
  const { data } = await apiClient.get<WorkshopCategoryResponse[]>("/workshop/categories");
  return data;
};
