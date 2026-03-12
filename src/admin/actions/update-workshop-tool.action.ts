import { apiClient } from "@/api/apiClient";
import type { WorkshopToolUpdate, WorkshopToolResponse } from "@/interfaces/workshop-tool.response";

export const updateWorkshopToolAction = async (
  id: string,
  tool: WorkshopToolUpdate,
): Promise<WorkshopToolResponse> => {
  const { data } = await apiClient.patch<WorkshopToolResponse>(`/workshop/tools/${id}`, tool);
  return data;
};
