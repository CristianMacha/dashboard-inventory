import { apiClient } from "@/api/apiClient";
import type { WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";

export const getWorkshopMaterialByIdAction = async (id: string): Promise<WorkshopMaterialResponse> => {
  const { data } = await apiClient.get<WorkshopMaterialResponse>(`/workshop/materials/${id}`);
  return data;
};
