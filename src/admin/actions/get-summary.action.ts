import { apiClient } from "@/api/apiClient";
import type { ISummaryResponse } from "@/interfaces/summary";

export const getSummaryAction = async (): Promise<ISummaryResponse> => {
  const { data } = await apiClient.get<ISummaryResponse>("/dashboard/summary");
  return data;
};
