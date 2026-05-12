import { apiClient } from "@/api/apiClient";
import type { WorkshopPurchaseOrderDto } from "@/interfaces/workshop-purchase-order.response";

export const getWorkshopPurchaseOrderByIdAction = async (
  id: string,
): Promise<WorkshopPurchaseOrderDto> => {
  const { data } = await apiClient.get<WorkshopPurchaseOrderDto>(
    `/workshop/purchase-orders/${id}`,
  );
  return data;
};
