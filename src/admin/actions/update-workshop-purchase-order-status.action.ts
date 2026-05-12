import { apiClient } from "@/api/apiClient";

type StatusAction = "send" | "receive" | "cancel";

export const updateWorkshopPurchaseOrderStatusAction = async (
  id: string,
  action: StatusAction,
): Promise<void> => {
  await apiClient.patch(`/workshop/purchase-orders/${id}/${action}`);
};
