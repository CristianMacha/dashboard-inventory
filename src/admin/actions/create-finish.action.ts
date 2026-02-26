import { apiClient } from "@/api/apiClient";
import type { FinishCreate, FinishResponse } from "@/interfaces/finish.response";

export const createFinishAction = async (
  finish: FinishCreate,
): Promise<FinishResponse> => {
  const { data } = await apiClient.post<FinishResponse>("/finishes", finish);
  return data;
};
