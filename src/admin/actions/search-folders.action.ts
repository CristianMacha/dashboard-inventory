import { apiClient } from "@/api/apiClient";
import type { FolderDto } from "@/interfaces/file.response";

export const searchFoldersAction = async (
  organizationId: string,
  name: string,
): Promise<FolderDto[]> => {
  const { data } = await apiClient.get<FolderDto[]>("/files/folders/search", {
    params: { organizationId, name },
  });
  return data;
};
