import { apiClient } from "@/api/apiClient";

export const uploadFileAction = async (
  folderId: string,
  organizationId: string,
  file: File,
): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ id: string }>(
    `/files/folders/${folderId}/upload`,
    formData,
    { params: { organizationId }, headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};
