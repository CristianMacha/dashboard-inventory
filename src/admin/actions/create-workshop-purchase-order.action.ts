import { apiClient } from "@/api/apiClient";
import type { CreateWorkshopPurchaseOrderBody } from "@/interfaces/workshop-purchase-order.response";

export const createWorkshopPurchaseOrderAction = async (
  body: CreateWorkshopPurchaseOrderBody,
): Promise<void> => {
  await apiClient.post("/workshop/purchase-orders", body);
};
