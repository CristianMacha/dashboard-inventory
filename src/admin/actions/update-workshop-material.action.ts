import { apiClient } from "@/api/apiClient";
import type { WorkshopMaterialUpdate, WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";

export const updateWorkshopMaterialAction = async (
  id: string,
  material: WorkshopMaterialUpdate,
): Promise<WorkshopMaterialResponse> => {
  const { data } = await apiClient.patch<WorkshopMaterialResponse>(`/workshop/materials/${id}`, material);
  return data;
};
