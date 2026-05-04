import { apiClient } from "@/api/apiClient";
import type { RejectWorkshopRequestBody } from "@/interfaces/workshop-request.response";

export const rejectWorkshopRequestAction = async (
  id: string,
  body: RejectWorkshopRequestBody,
): Promise<void> => {
  await apiClient.post(`/workshop/requests/${id}/reject`, body);
};
