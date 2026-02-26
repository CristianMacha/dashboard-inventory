import { apiClient } from "@/api/apiClient";
import type { SupplierResponse, SupplierUpdate } from "@/interfaces/supplier.response";

export const updateSupplierAction = async (
  id: string,
  supplier: SupplierUpdate,
): Promise<SupplierResponse> => {
  const { data } = await apiClient.patch<SupplierResponse>(`/suppliers/${id}`, supplier);
  return data;
};
