import { apiClient } from "@/api/apiClient";

export const receiveInvoiceAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchase-invoices/${id}/receive`);
};
