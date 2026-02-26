import { apiClient } from "@/api/apiClient";
import type { JobCreate } from "@/interfaces/job.response";

interface CreateJobResult {
  statusCode: number;
  message: string;
  id: string;
}

export const createJobAction = async (
  job: JobCreate,
): Promise<CreateJobResult> => {
  const { data } = await apiClient.post<CreateJobResult>("/jobs", job);
  return data;
};
