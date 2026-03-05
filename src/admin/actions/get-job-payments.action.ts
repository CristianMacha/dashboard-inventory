import { apiClient } from "@/api/apiClient";
import type { JobPaymentResponse } from "@/interfaces/job-payment.response";

export interface JobPaymentsQueryParams {
  jobId?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface JobPaymentsPage {
  payments: JobPaymentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getJobPaymentsAction = async (
  params: JobPaymentsQueryParams = {},
): Promise<JobPaymentsPage> => {
  const { data } = await apiClient.get<JobPaymentsPage>("/job-payments", {
    params,
  });
  return data;
};
