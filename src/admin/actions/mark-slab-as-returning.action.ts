import { apiClient } from "@/api/apiClient";

export const markSlabAsReturningAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/slabs/${id}/mark-as-returning`);
};
