import { PaymentPanel, type PaymentFormValues } from "@/admin/components/PaymentPanel";
import { getJobPaymentsByJobAction } from "@/admin/actions/get-job-payments-by-job.action";
import { recordJobPaymentAction } from "@/admin/actions/record-job-payment.action";
import { jobPaymentKeys, jobKeys } from "@/admin/queryKeys";
import type { JobStatus } from "@/interfaces/job.response";
import type { QueryClient } from "@tanstack/react-query";

const PAYABLE_STATUSES: JobStatus[] = ["APPROVED", "IN_PROGRESS", "COMPLETED"];

export function JobPaymentPanel({
  jobId,
  jobStatus,
}: {
  jobId: string;
  jobStatus: JobStatus;
}) {
  const canReceivePayment = PAYABLE_STATUSES.includes(jobStatus);

  return (
    <PaymentPanel
      queryKey={jobPaymentKeys.byJob(jobId)}
      queryFn={() => getJobPaymentsByJobAction(jobId)}
      mutationFn={(values: PaymentFormValues) =>
        recordJobPaymentAction({
          jobId,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          paymentDate: values.paymentDate,
          reference: values.reference || undefined,
        })
      }
      onSuccess={(queryClient: QueryClient) => {
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
        void queryClient.invalidateQueries({ queryKey: jobPaymentKeys.byJob(jobId) });
        void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: jobPaymentKeys.lists() });
      }}
      totalAmount={(data) => ((data as { jobTotalAmount: number }).jobTotalAmount) ?? 0}
      formId="job-payment-form"
      sheetDescription="Register a payment received from the client"
      canRecordPayment={canReceivePayment}
    />
  );
}
