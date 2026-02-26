import { apiClient } from "@/api/apiClient";
import type { PurchaseInvoiceSelectResponse } from "@/interfaces/purchase-invoice.response";

export interface PurchaseInvoicesSelectParams {
  supplierId?: string;
  status?: string;
}

export const getPurchaseInvoicesForSelectAction = async (
  params: PurchaseInvoicesSelectParams = {},
): Promise<PurchaseInvoiceSelectResponse[]> => {
  const { data } = await apiClient.get<PurchaseInvoiceSelectResponse[]>(
    "/purchase-invoices/select",
    { params },
  );
  return data;
};
