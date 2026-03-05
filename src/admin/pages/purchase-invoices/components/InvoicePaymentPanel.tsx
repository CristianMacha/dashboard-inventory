import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

import { getInvoicePaymentsByInvoiceAction } from "@/admin/actions/get-invoice-payments-by-invoice.action";
import { recordInvoicePaymentAction } from "@/admin/actions/record-invoice-payment.action";
import { invoicePaymentKeys, purchaseInvoiceKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import { formatDate } from "@/lib/format";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const today = () => new Date().toISOString().slice(0, 10);

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  paymentDate: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ─── Payment Progress Bar ─────────────────────────────────────────────────────

function PaymentProgress({
  paid,
  total,
}: {
  paid: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-green-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function InvoicePaymentPanel({ invoiceId }: { invoiceId: string }) {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: invoicePaymentKeys.byInvoice(invoiceId),
    queryFn: () => getInvoicePaymentsByInvoiceAction(invoiceId),
  });

  const { control, handleSubmit, reset } = useForm<PaymentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
      paymentMethod: undefined,
      paymentDate: today(),
      reference: "",
    },
  });

  useEffect(() => {
    if (sheetOpen) {
      reset({
        amount: data?.remaining ?? 0,
        paymentMethod: undefined,
        paymentDate: today(),
        reference: "",
      });
    }
  }, [sheetOpen, data?.remaining, reset]);

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) =>
      recordInvoicePaymentAction({
        invoiceId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate,
        reference: values.reference || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicePaymentKeys.byInvoice(invoiceId) });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(invoiceId) });
      toast.success("Payment recorded");
      setSheetOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to record payment");
    },
  });

  const onSubmit = (values: PaymentFormValues) => mutation.mutate(values as PaymentFormValues);

  const paid = data?.totalPaid ?? 0;
  const remaining = data?.remaining ?? 0;
  const total = data?.invoiceTotalAmount ?? 0;
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
        {!isPaid && (
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <Plus className="size-4" />
            Record Payment
          </Button>
        )}
      </div>

      {/* Summary card */}
      {!isLoading && data && (
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
      )}

      {/* Payments history */}
      {!isLoading && data && data.payments.length > 0 && (
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
                {data.payments.map((p) => (
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
      )}

      {/* Record Payment Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Record Payment
            </SheetTitle>
            <SheetDescription>
              Register a payment for this invoice
            </SheetDescription>
          </SheetHeader>

          <form
            id="invoice-payment-form"
            className="flex-1 overflow-y-auto p-4"
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="pay-amount">Amount</FieldLabel>
                    <Input
                      id="pay-amount"
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
                    <FieldLabel htmlFor="pay-method">Payment Method</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="pay-method">
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
                    <FieldLabel htmlFor="pay-date">Payment Date</FieldLabel>
                    <Input id="pay-date" type="date" {...field} />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="reference"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="pay-ref">
                      Reference <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input id="pay-ref" {...field} placeholder="e.g. TRF-001" />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <SheetFooter className="flex-row justify-end border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => setSheetOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="invoice-payment-form" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Saving…" : "Record Payment"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
