export type PaymentMethod = "CASH" | "BANK_TRANSFER";

export interface JobPaymentResponse {
  id: string;
  jobId: string;
  projectName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  createdBy: string;
  createdAt: string;
}

export interface JobPaymentsWithSummary {
  payments: JobPaymentResponse[];
  totalPaid: number;
  remaining: number;
  jobTotalAmount: number;
}

export interface JobPaymentCreate {
  jobId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
}
