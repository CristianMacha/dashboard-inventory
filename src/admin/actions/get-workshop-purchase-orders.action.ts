import { apiClient } from "@/api/apiClient";
import type { WorkshopPurchaseOrderDto } from "@/interfaces/workshop-purchase-order.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export const getWorkshopPurchaseOrdersAction = async (params: {
  page: number;
  limit: number;
  status?: string;
  supplierId?: string;
}): Promise<PaginatedResult<WorkshopPurchaseOrderDto>> => {
  const { data } = await apiClient.get<PaginatedResult<WorkshopPurchaseOrderDto>>(
    "/workshop/purchase-orders",
    { params },
  );
  return data;
};
