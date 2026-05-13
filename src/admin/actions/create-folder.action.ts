import { apiClient } from "@/api/apiClient";

interface CreateFolderDto {
  name: string;
  organizationId: string;
  parentId?: string;
}

export const createFolderAction = async (
  dto: CreateFolderDto,
): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>("/files/folders", dto);
  return data;
};
