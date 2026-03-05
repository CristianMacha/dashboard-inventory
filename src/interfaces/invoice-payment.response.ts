export type PaymentMethod = "CASH" | "BANK_TRANSFER";

export interface InvoicePaymentResponse {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  createdBy: string;
  createdAt: string;
}

export interface InvoicePaymentsWithSummary {
  payments: InvoicePaymentResponse[];
  totalPaid: number;
  remaining: number;
  invoiceTotalAmount: number;
}

export interface InvoicePaymentCreate {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
}
