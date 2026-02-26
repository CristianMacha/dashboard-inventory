import { apiClient } from "@/api/apiClient";
import type { JobDetailResponse } from "@/interfaces/job.response";

export const getJobByIdAction = async (
  id: string,
): Promise<JobDetailResponse> => {
  if (!id) throw new Error("Job ID is required");
  const { data } = await apiClient.get<JobDetailResponse>(`/jobs/${id}`);
  return data;
};
