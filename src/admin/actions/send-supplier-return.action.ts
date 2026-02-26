import { apiClient } from "@/api/apiClient";

export const sendSupplierReturnAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchasing/supplier-returns/${id}/send`);
};
