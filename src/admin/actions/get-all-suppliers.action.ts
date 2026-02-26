import { apiClient } from "@/api/apiClient";
import type { SupplierResponse } from "@/interfaces/supplier.response";

export const getAllSuppliersAction = async (): Promise<SupplierResponse[]> => {
  const { data } = await apiClient.get<SupplierResponse[]>("/suppliers");
  return data;
};
