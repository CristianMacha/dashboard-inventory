import { apiClient } from "@/api/apiClient";

export const cancelJobAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/jobs/${id}/cancel`);
};
