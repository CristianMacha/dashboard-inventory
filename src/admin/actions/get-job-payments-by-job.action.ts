import { apiClient } from "@/api/apiClient";
import type { JobPaymentsWithSummary } from "@/interfaces/job-payment.response";

export const getJobPaymentsByJobAction = async (
  jobId: string,
): Promise<JobPaymentsWithSummary> => {
  const { data } = await apiClient.get<JobPaymentsWithSummary>(
    `/job-payments/job/${jobId}`,
  );
  return data;
};
