import { apiClient } from "@/api/apiClient";
import type { InvoiceItemCreate } from "@/interfaces/purchase-invoice.response";

export const addInvoiceItemAction = async (
  invoiceId: string,
  item: InvoiceItemCreate,
): Promise<void> => {
  await apiClient.post(`/purchase-invoices/${invoiceId}/items`, item);
};
