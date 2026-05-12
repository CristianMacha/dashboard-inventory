import { apiClient } from "@/api/apiClient";

export const deliverWorkshopRequestAction = async (id: string): Promise<void> => {
  await apiClient.post(`/workshop/requests/${id}/deliver`);
};
