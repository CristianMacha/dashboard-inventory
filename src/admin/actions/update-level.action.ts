import { apiClient } from "@/api/apiClient";
import type { LevelResponse, LevelUpdate } from "@/interfaces/level.response";

export const updateLevelAction = async (
  id: string,
  level: LevelUpdate,
): Promise<LevelResponse> => {
  const { data } = await apiClient.patch<LevelResponse>(`/levels/${id}`, level);
  return data;
};
