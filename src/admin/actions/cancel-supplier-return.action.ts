import { apiClient } from "@/api/apiClient";

export const cancelSupplierReturnAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchasing/supplier-returns/${id}/cancel`);
};
