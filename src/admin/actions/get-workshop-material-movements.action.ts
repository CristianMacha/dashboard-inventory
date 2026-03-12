import { apiClient } from "@/api/apiClient";
import type { MaterialMovementDto } from "@/interfaces/workshop-material.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopMaterialMovementsAction = async (
  id: string,
  params: { page: number; limit: number },
): Promise<PaginatedResult<MaterialMovementDto>> => {
  const { data } = await apiClient.get<PaginatedResult<MaterialMovementDto>>(
    `/workshop/materials/${id}/movements`,
    { params },
  );
  return data;
};
