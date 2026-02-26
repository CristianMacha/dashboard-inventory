import { apiClient } from "@/api/apiClient";
import type { JobItemCreate } from "@/interfaces/job.response";

export const addJobItemAction = async (
  jobId: string,
  item: JobItemCreate,
): Promise<void> => {
  await apiClient.post(`/jobs/${jobId}/items`, item);
};
