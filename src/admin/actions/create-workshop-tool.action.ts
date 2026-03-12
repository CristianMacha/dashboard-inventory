import { apiClient } from "@/api/apiClient";
import type { WorkshopToolCreate, WorkshopToolResponse } from "@/interfaces/workshop-tool.response";

export const createWorkshopToolAction = async (
  tool: WorkshopToolCreate,
): Promise<WorkshopToolResponse> => {
  const { data } = await apiClient.post<WorkshopToolResponse>("/workshop/tools", tool);
  return data;
};
