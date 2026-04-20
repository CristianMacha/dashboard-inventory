import { apiClient } from "@/api/apiClient";
import type { SlabStatus } from "@/interfaces/slab.response";

export interface BulkUpdateSlabStatusResult {
  updated: number;
  failed: { slabId: string; reason: string }[];
}

export const bulkUpdateSlabStatusAction = async (
  slabIds: string[],
  status: SlabStatus,
): Promise<BulkUpdateSlabStatusResult> => {
  const { data } = await apiClient.patch<BulkUpdateSlabStatusResult>(
    "/slabs/bulk-status",
    { slabIds, status },
  );
  return data;
};
