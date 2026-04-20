import { apiClient } from "@/api/apiClient";
import type { InventorySummaryResponse } from "@/interfaces/inventory-summary.response";

export const getInventorySummaryAction = async (params?: {
  productId?: string;
}): Promise<InventorySummaryResponse> => {
  const { data } = await apiClient.get<InventorySummaryResponse>(
    "/inventory/summary",
    { params },
  );
  return data;
};
