import { apiClient } from "@/api/apiClient";

export const payInvoiceAction = async (id: string): Promise<void> => {
  await apiClient.patch(`/purchase-invoices/${id}/pay`);
};
