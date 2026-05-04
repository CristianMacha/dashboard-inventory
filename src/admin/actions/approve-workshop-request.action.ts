import { apiClient } from "@/api/apiClient";

export const approveWorkshopRequestAction = async (id: string): Promise<void> => {
  await apiClient.post(`/workshop/requests/${id}/approve`);
};
