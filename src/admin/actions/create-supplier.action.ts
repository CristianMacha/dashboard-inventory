import { apiClient } from "@/api/apiClient";
import type {
  SupplierCreate,
  SupplierResponse,
} from "@/interfaces/supplier.response";

export const createSupplierAction = async (
  supplier: SupplierCreate,
): Promise<SupplierResponse> => {
  const { data } = await apiClient.post<SupplierResponse>(
    "/suppliers",
    supplier,
  );
  return data;
};
