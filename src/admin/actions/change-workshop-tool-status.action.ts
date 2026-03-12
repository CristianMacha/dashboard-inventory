import { apiClient } from "@/api/apiClient";
import type { ChangeToolStatusDto } from "@/interfaces/workshop-tool.response";

export const changeWorkshopToolStatusAction = async (
  id: string,
  dto: ChangeToolStatusDto,
): Promise<void> => {
  await apiClient.post(`/workshop/tools/${id}/status`, dto);
};
