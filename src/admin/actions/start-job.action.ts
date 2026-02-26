import { apiClient } from "@/api/apiClient";

export const startJobAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/jobs/${id}/start`);
};
