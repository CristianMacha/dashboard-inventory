import { apiClient } from "@/api/apiClient";

export const removeJobItemAction = async (
  jobId: string,
  itemId: string,
): Promise<void> => {
  await apiClient.delete(`/jobs/${jobId}/items/${itemId}`);
};
