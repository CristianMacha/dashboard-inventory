import { apiClient } from "@/api/apiClient";

export const cancelInvoiceAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchase-invoices/${id}/cancel`);
};
