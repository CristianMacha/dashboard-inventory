import { apiClient } from "@/api/apiClient";

export const addFileTagsAction = async (
  fileId: string,
  organizationId: string,
  tags: string[],
): Promise<void> => {
  await apiClient.post(`/files/${fileId}/tags`, { tags }, { params: { organizationId } });
};
