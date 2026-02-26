import { apiClient } from "@/api/apiClient";
import type { LevelResponse } from "@/interfaces/level.response";

export const getLevelsAction = async (): Promise<LevelResponse[]> => {
  const { data } = await apiClient.get<LevelResponse[]>("/levels");
  return data;
};
