import { apiClient } from "@/api/apiClient";

export const approveJobAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/jobs/${id}/approve`);
};
