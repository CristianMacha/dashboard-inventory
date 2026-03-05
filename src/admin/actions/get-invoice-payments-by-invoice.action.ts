import { apiClient } from "@/api/apiClient";
import type { InvoicePaymentsWithSummary } from "@/interfaces/invoice-payment.response";

export const getInvoicePaymentsByInvoiceAction = async (
  invoiceId: string,
): Promise<InvoicePaymentsWithSummary> => {
  const { data } = await apiClient.get<InvoicePaymentsWithSummary>(
    `/invoice-payments/invoice/${invoiceId}`,
  );
  return data;
};
