import { apiClient } from "@/api/apiClient";

export const removeInvoiceItemAction = async (
  invoiceId: string,
  itemId: string,
): Promise<void> => {
  await apiClient.delete(
    `/purchase-invoices/${invoiceId}/items/${itemId}`,
  );
};
