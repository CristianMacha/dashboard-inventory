import { apiClient } from "@/api/apiClient";

export const reserveSlabAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/slabs/${id}/reserve`);
};
