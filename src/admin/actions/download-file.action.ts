import { apiClient } from "@/api/apiClient";

export const downloadFileAction = async (
  fileId: string,
  organizationId: string,
  filename: string,
): Promise<void> => {
  const response = await apiClient.get(`/files/${fileId}/download`, {
    params: { organizationId },
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
