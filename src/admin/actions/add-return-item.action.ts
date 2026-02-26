import { apiClient } from "@/api/apiClient";
import type { ReturnItemCreate } from "@/interfaces/supplier-return.response";

export const addReturnItemAction = async (
  returnId: string,
  item: ReturnItemCreate,
): Promise<void> => {
  await apiClient.post(`/purchasing/supplier-returns/${returnId}/items`, item);
};
