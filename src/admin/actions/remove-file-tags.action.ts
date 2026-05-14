import { apiClient } from "@/api/apiClient";

export const removeFileTagsAction = async (
  fileId: string,
  organizationId: string,
  tags: string[],
): Promise<void> => {
  await apiClient.delete(`/files/${fileId}/tags`, {
    data: { tags },
    params: { organizationId },
  });
};
