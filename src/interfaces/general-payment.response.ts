import type { PaymentMethod } from "./invoice-payment.response";

export type GeneralPaymentType = "INCOME" | "EXPENSE";

export type GeneralPaymentCategory =
  | "SALARY"
  | "RENT"
  | "UTILITIES"
  | "TRANSPORT"
  | "MATERIAL_SALE"
  | "CLIENT_ADVANCE"
  | "SUPPLIER_REFUND"
  | "BANK_FEES"
  | "OTHER_EXPENSE"
  | "OTHER_INCOME";

export interface GeneralPaymentResponse {
  id: string;
  type: GeneralPaymentType;
  category: GeneralPaymentCategory;
  description: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  createdBy: string;
  createdAt: string;
}

export interface GeneralPaymentCreate {
  type: GeneralPaymentType;
  category: GeneralPaymentCategory;
  description?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
}
