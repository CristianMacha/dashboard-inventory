import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, CreditCard, Banknote, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { getErrorMessage } from "@/api/apiClient";
import { formatDate } from "@/lib/format";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const today = () => new Date().toISOString().slice(0, 10);

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  paymentDate: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export type PaymentMethod = "CASH" | "BANK_TRANSFER";

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string | null;
}

export interface PaymentSummary {
  totalPaid: number;
  remaining: number;
  payments: PaymentRecord[];
}

// Covariant-friendly summary type for use with concrete API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPaymentSummary = { totalPaid: number; remaining: number; payments: any[] };

// ─── Payment Progress Bar ─────────────────────────────────────────────────────

export function PaymentProgress({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  return (
    <div
      className="w-full h-1.5 rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(pct)}% paid`}
    >
      <div
        className="h-full rounded-full bg-green-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Payment History Table ─────────────────────────────────────────────────────

export function PaymentHistoryTable({ payments }: { payments: PaymentRecord[] }) {
  return (
    <Card className="py-0">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold">Payment History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold">Reference</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm">{formatDate(p.paymentDate)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    {p.paymentMethod === "CASH" ? (
                      <Banknote className="size-3.5 text-green-600" />
                    ) : (
                      <Building2 className="size-3.5 text-blue-600" />
                    )}
                    {p.paymentMethod === "CASH" ? "Cash" : "Bank Transfer"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {p.reference ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium text-green-700">
                  {currency.format(p.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Payment Summary Card ─────────────────────────────────────────────────────

export function PaymentSummaryCard({
  paid,
  remaining,
  total,
}: {
  paid: number;
  remaining: number;
  total: number;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total</p>
            <p className="text-base font-bold tabular-nums">{currency.format(total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Paid</p>
            <p className="text-base font-bold tabular-nums text-green-600">{currency.format(paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Remaining</p>
            <p className="text-base font-bold tabular-nums text-amber-600">{currency.format(remaining)}</p>
          </div>
        </div>
        <PaymentProgress paid={paid} total={total} />
      </CardContent>
    </Card>
  );
}

// ─── Record Payment Form Sheet ─────────────────────────────────────────────────

interface RecordPaymentSheetProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  remaining: number;
  isPending: boolean;
  onSubmit: (values: PaymentFormValues) => void;
  defaultRemaining: number;
}

export function RecordPaymentSheet({
  formId,
  open,
  onOpenChange,
  description,
  remaining,
  isPending,
  onSubmit,
  defaultRemaining,
}: RecordPaymentSheetProps) {
  const { control, handleSubmit, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      amount: 0,
      paymentMethod: undefined,
      paymentDate: today(),
      reference: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: defaultRemaining,
        paymentMethod: undefined,
        paymentDate: today(),
        reference: "",
      });
    }
  }, [open, defaultRemaining, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Record Payment
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form
          id={formId}
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-amount`}>Amount</FieldLabel>
                  <Input
                    id={`${formId}-amount`}
                    type="number"
                    min={0.01}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                  {remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Remaining: {currency.format(remaining)}
                    </p>
                  )}
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="paymentMethod"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-method`}>Payment Method</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={`${formId}-method`}>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="paymentDate"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-date`}>Payment Date</FieldLabel>
                  <Input id={`${formId}-date`} type="date" {...field} />
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="reference"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-ref`}>
                    Reference <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input id={`${formId}-ref`} {...field} placeholder="e.g. TRF-001" />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Saving…" : "Record Payment"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Generic Payment Panel ─────────────────────────────────────────────────────

interface PaymentPanelProps {
  queryKey: readonly unknown[];
  queryFn: () => Promise<AnyPaymentSummary>;
  mutationFn: (values: PaymentFormValues) => Promise<unknown>;
  onSuccess: (queryClient: ReturnType<typeof useQueryClient>) => void | Promise<void>;
  totalAmount: number | ((data: unknown) => number);
  formId: string;
  sheetDescription: string;
  canRecordPayment?: boolean;
}

export function PaymentPanel({
  queryKey,
  queryFn,
  mutationFn,
  onSuccess,
  totalAmount,
  formId,
  sheetDescription,
  canRecordPayment = true,
}: PaymentPanelProps) {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey, queryFn });

  const mutation = useMutation({
    mutationFn,
    onSuccess: async () => {
      await onSuccess(queryClient);
      toast.success("Payment recorded");
      setSheetOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to record payment"));
    },
  });

  const paid = (data?.totalPaid ?? 0) as number;
  const remaining = (data?.remaining ?? 0) as number;
  const total =
    typeof totalAmount === "function"
      ? (data ? totalAmount(data) : 0)
      : totalAmount;
  const isPaid = remaining <= 0 && total > 0;

  return (
    <>
      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : isPaid
              ? "Fully paid"
              : `${currency.format(remaining)} remaining`}
          </p>
        </div>
        {canRecordPayment && !isPaid && (
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <Plus className="size-4" />
            Record Payment
          </Button>
        )}
      </div>

      {!isLoading && data && (
        <PaymentSummaryCard paid={paid} remaining={remaining} total={total} />
      )}

      {!isLoading && data && data.payments.length > 0 && (
        <PaymentHistoryTable payments={data.payments} />
      )}

      <RecordPaymentSheet
        formId={formId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        description={sheetDescription}
        remaining={remaining}
        isPending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
        defaultRemaining={remaining}
      />
    </>
  );
}
