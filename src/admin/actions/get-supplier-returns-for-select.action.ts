import { apiClient } from "@/api/apiClient";
import type { SupplierReturnSelectResponse } from "@/interfaces/supplier-return.response";

export interface SupplierReturnsSelectParams {
  supplierId?: string;
  purchaseInvoiceId?: string;
  status?: string;
}

export const getSupplierReturnsForSelectAction = async (
  params: SupplierReturnsSelectParams = {},
): Promise<SupplierReturnSelectResponse[]> => {
  const { data } = await apiClient.get<SupplierReturnSelectResponse[]>(
    "/purchasing/supplier-returns/select",
    { params },
  );
  return data;
};
