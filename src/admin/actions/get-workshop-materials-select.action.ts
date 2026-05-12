import { apiClient } from "@/api/apiClient";
import type { WorkshopItemSelectDto } from "@/interfaces/workshop-request.response";

export const getWorkshopMaterialsSelectAction = async (params?: {
  search?: string;
}): Promise<WorkshopItemSelectDto[]> => {
  const { data } = await apiClient.get<WorkshopItemSelectDto[]>(
    "/workshop/materials/select",
    { params },
  );
  return data;
};
