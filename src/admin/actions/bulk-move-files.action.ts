import { apiClient } from "@/api/apiClient";

export const bulkMoveFilesAction = async (
  organizationId: string,
  fileIds: string[],
  targetFolderId: string,
): Promise<{ moved: number }> => {
  const { data } = await apiClient.patch<{ moved: number }>(
    "/files/bulk-move",
    { fileIds, targetFolderId },
    { params: { organizationId } },
  );
  return data;
};
