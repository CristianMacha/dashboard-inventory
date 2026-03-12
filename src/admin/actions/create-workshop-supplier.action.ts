import { apiClient } from "@/api/apiClient";
import type { WorkshopSupplierCreate, WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";

export const createWorkshopSupplierAction = async (
  supplier: WorkshopSupplierCreate,
): Promise<WorkshopSupplierResponse> => {
  const { data } = await apiClient.post<WorkshopSupplierResponse>("/workshop/suppliers", supplier);
  return data;
};
