import { apiClient } from "@/api/apiClient";
import type { WorkshopMaterialCreate, WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";

export const createWorkshopMaterialAction = async (
  material: WorkshopMaterialCreate,
): Promise<WorkshopMaterialResponse> => {
  const { data } = await apiClient.post<WorkshopMaterialResponse>("/workshop/materials", material);
  return data;
};
