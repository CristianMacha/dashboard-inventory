import { apiClient } from "@/api/apiClient";
import type { CashflowSummaryResponse } from "@/interfaces/cashflow.response";

export interface CashflowParams {
  fromDate?: string;
  toDate?: string;
}

export const getCashflowAction = async (
  params: CashflowParams = {},
): Promise<CashflowSummaryResponse> => {
  const { data } = await apiClient.get<CashflowSummaryResponse>(
    "/accounting/cashflow",
    { params },
  );
  return data;
};
