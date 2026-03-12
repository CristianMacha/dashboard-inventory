import { apiClient } from "@/api/apiClient";
import type { WorkshopToolResponse } from "@/interfaces/workshop-tool.response";

export const getWorkshopToolByIdAction = async (id: string): Promise<WorkshopToolResponse> => {
  const { data } = await apiClient.get<WorkshopToolResponse>(`/workshop/tools/${id}`);
  return data;
};
