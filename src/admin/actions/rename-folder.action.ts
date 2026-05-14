import { apiClient } from "@/api/apiClient";

export const renameFolderAction = async (
  folderId: string,
  organizationId: string,
  name: string,
): Promise<void> => {
  await apiClient.patch(`/files/folders/${folderId}`, { name }, { params: { organizationId } });
};
