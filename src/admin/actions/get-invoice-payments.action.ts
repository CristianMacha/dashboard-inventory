import { apiClient } from "@/api/apiClient";
import type { InvoicePaymentResponse } from "@/interfaces/invoice-payment.response";

export interface InvoicePaymentsQueryParams {
  invoiceId?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface InvoicePaymentsPage {
  payments: InvoicePaymentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getInvoicePaymentsAction = async (
  params: InvoicePaymentsQueryParams = {},
): Promise<InvoicePaymentsPage> => {
  const { data } = await apiClient.get<InvoicePaymentsPage>(
    "/invoice-payments",
    { params },
  );
  return data;
};
