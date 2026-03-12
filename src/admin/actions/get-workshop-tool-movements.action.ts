import { apiClient } from "@/api/apiClient";
import type { ToolMovementDto } from "@/interfaces/workshop-tool.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopToolMovementsAction = async (
  id: string,
  params: { page: number; limit: number },
): Promise<PaginatedResult<ToolMovementDto>> => {
  const { data } = await apiClient.get<PaginatedResult<ToolMovementDto>>(
    `/workshop/tools/${id}/movements`,
    { params },
  );
  return data;
};
