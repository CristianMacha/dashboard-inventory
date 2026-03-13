import { PaymentPanel, type PaymentFormValues } from "@/admin/components/PaymentPanel";
import { getInvoicePaymentsByInvoiceAction } from "@/admin/actions/get-invoice-payments-by-invoice.action";
import { recordInvoicePaymentAction } from "@/admin/actions/record-invoice-payment.action";
import { invoicePaymentKeys, purchaseInvoiceKeys } from "@/admin/queryKeys";
import type { QueryClient } from "@tanstack/react-query";

export function InvoicePaymentPanel({ invoiceId }: { invoiceId: string }) {
  return (
    <PaymentPanel
      queryKey={invoicePaymentKeys.byInvoice(invoiceId)}
      queryFn={() => getInvoicePaymentsByInvoiceAction(invoiceId)}
      mutationFn={(values: PaymentFormValues) =>
        recordInvoicePaymentAction({
          invoiceId,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          paymentDate: values.paymentDate,
          reference: values.reference || undefined,
        })
      }
      onSuccess={(queryClient: QueryClient) => {
        void queryClient.invalidateQueries({ queryKey: invoicePaymentKeys.byInvoice(invoiceId) });
        void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(invoiceId) });
      }}
      totalAmount={(data) => ((data as { invoiceTotalAmount: number }).invoiceTotalAmount) ?? 0}
      formId="invoice-payment-form"
      sheetDescription="Register a payment for this invoice"
    />
  );
}
