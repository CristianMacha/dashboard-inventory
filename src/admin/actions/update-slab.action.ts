import { apiClient } from "@/api/apiClient";
import type { SlabUpdate } from "@/interfaces/slab.response";

export const updateSlabAction = async (
  id: string,
  slab: SlabUpdate,
): Promise<void> => {
  await apiClient.patch<void>(`/slabs/${id}`, slab);
};
