import { apiClient } from "@/api/apiClient";
import type { LevelResponse } from "@/interfaces/level.response";

export const getActiveLevelsAction = async (): Promise<LevelResponse[]> => {
  const { data } = await apiClient.get<LevelResponse[]>("/levels/active");
  return data;
};
