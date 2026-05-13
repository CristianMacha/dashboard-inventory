import { apiClient } from "@/api/apiClient";
import type { FolderContentsDto } from "@/interfaces/file.response";

export const getFolderContentsAction = async (
  folderId: string,
  organizationId: string,
  page = 1,
  limit = 20,
): Promise<FolderContentsDto> => {
  const { data } = await apiClient.get<FolderContentsDto>(
    `/files/folders/${folderId}/contents`,
    { params: { organizationId, page, limit } },
  );
  return data;
};
