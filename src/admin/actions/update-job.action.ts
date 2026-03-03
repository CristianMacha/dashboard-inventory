import { apiClient } from "@/api/apiClient";
import type { JobDetailResponse } from "@/interfaces/job.response";

export interface JobUpdate {
  projectName?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  notes?: string;
  scheduledDate?: string;
  taxAmount?: number;
}

export const updateJobAction = async (
  id: string,
  data: JobUpdate,
): Promise<JobDetailResponse> => {
  const { data: result } = await apiClient.patch<JobDetailResponse>(`/jobs/${id}`, data);
  return result;
};
