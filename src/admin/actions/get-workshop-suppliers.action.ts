import { apiClient } from "@/api/apiClient";
import type { WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";

export const getWorkshopSuppliersAction = async (): Promise<WorkshopSupplierResponse[]> => {
  const { data } = await apiClient.get<WorkshopSupplierResponse[]>("/workshop/suppliers");
  return data;
};
