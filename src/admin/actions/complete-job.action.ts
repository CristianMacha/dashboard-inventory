import { apiClient } from "@/api/apiClient";

export const completeJobAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/jobs/${id}/complete`);
};
