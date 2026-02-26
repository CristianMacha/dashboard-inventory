import { apiClient } from "@/api/apiClient";
import type { PurchaseInvoiceDetailResponse } from "@/interfaces/purchase-invoice.response";

export const getPurchaseInvoiceByIdAction = async (
  id: string,
): Promise<PurchaseInvoiceDetailResponse> => {
  if (!id) throw new Error("Invoice ID is required");
  const { data } = await apiClient.get<PurchaseInvoiceDetailResponse>(
    `/purchase-invoices/${id}`,
  );
  return data;
};
