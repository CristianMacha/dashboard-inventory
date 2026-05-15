import { apiClient } from "@/api/apiClient";
import type { FolderDto } from "@/interfaces/file.response";

export const getFolderAction = async (
  folderId: string,
  organizationId: string,
): Promise<FolderDto> => {
  const { data } = await apiClient.get<FolderDto>(`/files/folders/${folderId}`, {
    params: { organizationId },
  });
  return data;
};
