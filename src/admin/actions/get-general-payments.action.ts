import { apiClient } from "@/api/apiClient";
import type { GeneralPaymentResponse } from "@/interfaces/general-payment.response";

export interface GeneralPaymentsQueryParams {
  type?: string;
  category?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface GeneralPaymentsPage {
  payments: GeneralPaymentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getGeneralPaymentsAction = async (
  params: GeneralPaymentsQueryParams = {},
): Promise<GeneralPaymentsPage> => {
  const { data } = await apiClient.get<GeneralPaymentsPage>(
    "/general-payments",
    { params },
  );
  return data;
};
