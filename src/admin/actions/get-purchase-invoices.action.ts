import { apiClient } from "@/api/apiClient";
import type { PurchaseInvoiceResponse } from "@/interfaces/purchase-invoice.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface PurchaseInvoicesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  status?: string;
}

export const getPurchaseInvoicesAction = async (
  params: PurchaseInvoicesQueryParams = {},
): Promise<PaginatedResult<PurchaseInvoiceResponse>> => {
  const { data } = await apiClient.get<
    PaginatedResult<PurchaseInvoiceResponse>
  >("/purchase-invoices", { params });
  return data;
};
