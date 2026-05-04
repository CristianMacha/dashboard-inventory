import { apiClient } from "@/api/apiClient";
import type { WorkshopRequestDto } from "@/interfaces/workshop-request.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopRequestsAction = async (params: {
  page: number;
  limit: number;
  status?: string;
  requestType?: string;
}): Promise<PaginatedResult<WorkshopRequestDto>> => {
  const { data } = await apiClient.get<PaginatedResult<WorkshopRequestDto>>(
    "/workshop/requests",
    { params },
  );
  return data;
};
