import { apiClient } from "@/api/apiClient";
import type { JobItem } from "@/interfaces/job.response";

export interface BulkJobItemDto {
  slabId: string;
  unitPrice: number;
  description?: string;
}

export const addBulkJobItemsAction = async (
  jobId: string,
  items: BulkJobItemDto[],
): Promise<JobItem[]> => {
  const { data } = await apiClient.post<JobItem[]>(`/jobs/${jobId}/items/bulk`, { items });
  return data;
};
