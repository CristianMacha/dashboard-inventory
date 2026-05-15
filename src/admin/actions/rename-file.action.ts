import { apiClient } from "@/api/apiClient";

export const renameFileAction = async (
  fileId: string,
  organizationId: string,
  name: string,
): Promise<void> => {
  await apiClient.patch(`/files/${fileId}/rename`, { name }, { params: { organizationId } });
};
