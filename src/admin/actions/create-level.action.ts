import { apiClient } from "@/api/apiClient";
import type { LevelCreate, LevelResponse } from "@/interfaces/level.response";

export const createLevelAction = async (
  level: LevelCreate,
): Promise<LevelResponse> => {
  const { data } = await apiClient.post<LevelResponse>("/levels", level);
  return data;
};
