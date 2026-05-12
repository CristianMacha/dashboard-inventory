import { apiClient } from "@/api/apiClient";

export const approveWorkshopRequestAction = async (
  id: string,
  approvedQuantity?: number,
): Promise<void> => {
  await apiClient.post(`/workshop/requests/${id}/approve`, null, {
    params: approvedQuantity != null ? { approvedQuantity } : undefined,
  });
};
