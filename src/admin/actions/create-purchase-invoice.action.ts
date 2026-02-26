import { apiClient } from "@/api/apiClient";
import type { PurchaseInvoiceCreate } from "@/interfaces/purchase-invoice.response";

interface CreateInvoiceResult {
  statusCode: number;
  message: string;
  id: string;
}

export const createPurchaseInvoiceAction = async (
  invoice: PurchaseInvoiceCreate,
): Promise<CreateInvoiceResult> => {
  const { data } = await apiClient.post<CreateInvoiceResult>(
    "/purchase-invoices",
    invoice,
  );
  return data;
};
