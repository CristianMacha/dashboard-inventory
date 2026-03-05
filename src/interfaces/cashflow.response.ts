export interface CashflowSummaryResponse {
  totalIngress: number;
  totalEgress: number;
  cashBalance: number;
  jobIncome: number;
  generalIncome: number;
  invoiceExpenses: number;
  generalExpenses: number;
  fromDate: string | null;
  toDate: string | null;
}
