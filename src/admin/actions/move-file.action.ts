import { apiClient } from "@/api/apiClient";

export const moveFileAction = async (
  fileId: string,
  organizationId: string,
  targetFolderId: string,
): Promise<void> => {
  await apiClient.patch(
    `/files/${fileId}/move`,
    { targetFolderId },
    { params: { organizationId } },
  );
};
