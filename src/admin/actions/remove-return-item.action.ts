import { apiClient } from "@/api/apiClient";

export const removeReturnItemAction = async (
  returnId: string,
  itemId: string,
): Promise<void> => {
  await apiClient.delete(`/purchasing/supplier-returns/${returnId}/items/${itemId}`);
};
