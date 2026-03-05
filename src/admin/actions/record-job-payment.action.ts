import { apiClient } from "@/api/apiClient";
import type { JobPaymentCreate } from "@/interfaces/job-payment.response";

export const recordJobPaymentAction = async (
  payload: JobPaymentCreate,
): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>("/job-payments", payload);
  return data;
};
