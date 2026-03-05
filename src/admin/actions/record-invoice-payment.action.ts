import { apiClient } from "@/api/apiClient";
import type { InvoicePaymentCreate } from "@/interfaces/invoice-payment.response";

export const recordInvoicePaymentAction = async (
  payload: InvoicePaymentCreate,
): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>("/invoice-payments", payload);
  return data;
};
