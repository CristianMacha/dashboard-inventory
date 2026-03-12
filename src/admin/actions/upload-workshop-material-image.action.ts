import { apiClient } from "@/api/apiClient";

export const uploadWorkshopMaterialImageAction = async (
  id: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/workshop/materials/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteWorkshopMaterialImageAction = async (id: string): Promise<void> => {
  await apiClient.delete(`/workshop/materials/${id}/image`);
};
