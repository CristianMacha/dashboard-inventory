import { apiClient } from "@/api/apiClient";
import type { FolderDto } from "@/interfaces/file.response";

export const getRootFoldersAction = async (
  organizationId: string,
): Promise<FolderDto[]> => {
  const { data } = await apiClient.get<FolderDto[]>("/files/folders", {
    params: { organizationId },
  });
  return data;
};
