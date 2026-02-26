import { apiClient } from "@/api/apiClient";

export const creditSupplierReturnAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchasing/supplier-returns/${id}/credit`);
};
