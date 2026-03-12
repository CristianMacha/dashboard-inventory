import { apiClient } from "@/api/apiClient";

export const deleteWorkshopToolAction = async (id: string): Promise<void> => {
  await apiClient.delete(`/workshop/tools/${id}`);
};
