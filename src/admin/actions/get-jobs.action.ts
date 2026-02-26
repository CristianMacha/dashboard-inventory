import { apiClient } from "@/api/apiClient";
import type { JobResponse } from "@/interfaces/job.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getJobsAction = async (
  params: JobsQueryParams = {},
): Promise<PaginatedResult<JobResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<JobResponse>>("/jobs", {
    params,
  });
  return data;
};
