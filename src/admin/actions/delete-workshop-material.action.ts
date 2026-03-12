import { apiClient } from "@/api/apiClient";

export const deleteWorkshopMaterialAction = async (id: string): Promise<void> => {
  await apiClient.delete(`/workshop/materials/${id}`);
};
