import { apiClient } from "@/api/apiClient";
import type { WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopMaterialsAction = async (params: {
  page: number;
  limit: number;
}): Promise<PaginatedResult<WorkshopMaterialResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<WorkshopMaterialResponse>>(
    "/workshop/materials",
    { params },
  );
  return data;
};
