import { apiClient } from "@/api/apiClient";

export const uploadBundleImageAction = async (
  bundleId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/bundles/${bundleId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
