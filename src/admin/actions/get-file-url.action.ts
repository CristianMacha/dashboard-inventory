import { apiClient } from "@/api/apiClient";

export const getFileUrlAction = async (
  fileId: string,
  organizationId: string,
): Promise<string> => {
  const { data } = await apiClient.get<{ url: string }>(
    `/files/${fileId}/url`,
    { params: { organizationId } },
  );
  return data.url;
};
