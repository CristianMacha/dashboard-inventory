import { apiClient } from "@/api/apiClient";
import type { SupplierResponse } from "@/interfaces/supplier.response";

export const getSuppliersAction = async (): Promise<SupplierResponse[]> => {
  const { data } = await apiClient.get<SupplierResponse[]>("/suppliers/active");
  return data;
};
