import { apiClient } from "@/api/apiClient";
import type { FinishResponse } from "@/interfaces/finish.response";

export const getFinishesAction = async (): Promise<FinishResponse[]> => {
  const { data } = await apiClient.get<FinishResponse[]>("/finishes/active");
  return data;
};
