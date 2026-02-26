import { apiClient } from "@/api/apiClient";
import type { FinishResponse, FinishUpdate } from "@/interfaces/finish.response";

export const updateFinishAction = async (
  id: string,
  finish: FinishUpdate,
): Promise<FinishResponse> => {
  const { data } = await apiClient.patch<FinishResponse>(`/finishes/${id}`, finish);
  return data;
};
