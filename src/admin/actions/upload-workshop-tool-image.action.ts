import { apiClient } from "@/api/apiClient";

export const uploadWorkshopToolImageAction = async (
  id: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/workshop/tools/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteWorkshopToolImageAction = async (id: string): Promise<void> => {
  await apiClient.delete(`/workshop/tools/${id}/image`);
};
