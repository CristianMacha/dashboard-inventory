import { apiClient } from "@/api/apiClient";
import type { WorkshopSupplierUpdate, WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";

export const updateWorkshopSupplierAction = async (
  id: string,
  supplier: WorkshopSupplierUpdate,
): Promise<WorkshopSupplierResponse> => {
  const { data } = await apiClient.patch<WorkshopSupplierResponse>(`/workshop/suppliers/${id}`, supplier);
  return data;
};
