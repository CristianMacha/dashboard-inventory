import { apiClient } from "@/api/apiClient";
import type { WorkshopToolResponse } from "@/interfaces/workshop-tool.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopToolsAction = async (params: {
  page: number;
  limit: number;
}): Promise<PaginatedResult<WorkshopToolResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<WorkshopToolResponse>>(
    "/workshop/tools",
    { params },
  );
  return data;
};
