import { apiClient } from "@/api/apiClient";
import type { WorkshopItemSelectDto } from "@/interfaces/workshop-request.response";

export const getWorkshopToolsSelectAction = async (params?: {
  search?: string;
}): Promise<WorkshopItemSelectDto[]> => {
  const { data } = await apiClient.get<WorkshopItemSelectDto[]>(
    "/workshop/tools/select",
    { params },
  );
  return data;
};
