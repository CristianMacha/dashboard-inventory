import { apiClient } from "@/api/apiClient";

export const moveFolderAction = async (
  folderId: string,
  organizationId: string,
  targetParentId: string | null,
): Promise<void> => {
  await apiClient.patch(
    `/files/folders/${folderId}/move`,
    { targetParentId },
    { params: { organizationId } },
  );
};
