import type {
  GeneralPaymentCategory,
  GeneralPaymentType,
} from "@/interfaces/general-payment.response";

export const GENERAL_PAYMENT_TYPES: {
  value: GeneralPaymentType;
  label: string;
}[] = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
];

export const GENERAL_PAYMENT_CATEGORIES: {
  value: GeneralPaymentCategory;
  label: string;
  type: GeneralPaymentType;
}[] = [
  { value: "MATERIAL_SALE", label: "Material Sale", type: "INCOME" },
  { value: "CLIENT_ADVANCE", label: "Client Advance", type: "INCOME" },
  { value: "SUPPLIER_REFUND", label: "Supplier Refund", type: "INCOME" },
  { value: "OTHER_INCOME", label: "Other Income", type: "INCOME" },
  { value: "SALARY", label: "Salary", type: "EXPENSE" },
  { value: "RENT", label: "Rent", type: "EXPENSE" },
  { value: "UTILITIES", label: "Utilities", type: "EXPENSE" },
  { value: "TRANSPORT", label: "Transport", type: "EXPENSE" },
  { value: "BANK_FEES", label: "Bank Fees", type: "EXPENSE" },
  { value: "OTHER_EXPENSE", label: "Other Expense", type: "EXPENSE" },
];

export const GENERAL_PAYMENT_TYPE_CONFIG: Record<
  GeneralPaymentType,
  { label: string; className: string }
> = {
  INCOME: {
    label: "Income",
    className:
      "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800",
  },
  EXPENSE: {
    label: "Expense",
    className:
      "bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800",
  },
};
