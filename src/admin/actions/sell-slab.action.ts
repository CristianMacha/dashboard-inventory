import { apiClient } from "@/api/apiClient";

export const sellSlabAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/slabs/${id}/sell`);
};
