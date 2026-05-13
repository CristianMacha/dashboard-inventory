import { apiClient } from "@/api/apiClient";

export const deleteFileAction = async (
  fileId: string,
  organizationId: string,
): Promise<void> => {
  await apiClient.delete(`/files/${fileId}`, { params: { organizationId } });
};
