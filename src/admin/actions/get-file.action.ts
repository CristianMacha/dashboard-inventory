import { apiClient } from "@/api/apiClient";
import type { FileRecordDto } from "@/interfaces/file.response";

export const getFileAction = async (
  fileId: string,
  organizationId: string,
): Promise<FileRecordDto> => {
  const { data } = await apiClient.get<FileRecordDto>(`/files/${fileId}`, {
    params: { organizationId },
  });
  return data;
};
