import { apiClient } from "@/api/apiClient";
import type { SupplierReturnResponse } from "@/interfaces/supplier-return.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface SupplierReturnsQueryParams {
  page?: number;
  limit?: number;
  supplierId?: string;
  status?: string;
  purchaseInvoiceId?: string;
}

export const getSupplierReturnsAction = async (
  params: SupplierReturnsQueryParams = {},
): Promise<PaginatedResult<SupplierReturnResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<SupplierReturnResponse>>(
    "/purchasing/supplier-returns",
    { params },
  );
  return data;
};
