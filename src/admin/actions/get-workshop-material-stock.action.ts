import { apiClient } from "@/api/apiClient";

export const getWorkshopMaterialStockAction = async (
  id: string,
): Promise<{ currentStock: number }> => {
  const { data } = await apiClient.get<{ currentStock: number }>(
    `/workshop/materials/${id}/stock`,
  );
  return data;
};
