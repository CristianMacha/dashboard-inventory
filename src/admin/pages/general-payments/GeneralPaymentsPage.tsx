import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { Loader2, PlusIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { DataTable } from "@/admin/pages/products/DataTable";
import { QueryError } from "@/components/ui/query-error";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  getGeneralPaymentsAction,
} from "@/admin/actions/get-general-payments.action";
import { recordGeneralPaymentAction } from "@/admin/actions/record-general-payment.action";
import { cashflowKeys, generalPaymentKeys } from "@/admin/queryKeys";
import type { GeneralPaymentResponse } from "@/interfaces/general-payment.response";
import { formatDate } from "@/lib/format";
import {
  GENERAL_PAYMENT_CATEGORIES,
  GENERAL_PAYMENT_TYPES,
  GENERAL_PAYMENT_TYPE_CONFIG,
} from "@/lib/general-payment";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const columns: ColumnDef<GeneralPaymentResponse>[] = [
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatDate(row.original.paymentDate)}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const { label, className } = GENERAL_PAYMENT_TYPE_CONFIG[row.original.type];
      return <StatusBadge label={label} className={className} />;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = GENERAL_PAYMENT_CATEGORIES.find(
        (c) => c.value === row.original.category,
      );
      return <span className="text-sm">{cat?.label ?? row.original.category}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) =>
      row.original.description ? (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
          {row.original.description}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span
        className={`tabular-nums font-medium ${
          row.original.type === "INCOME" ? "text-green-700" : "text-red-700"
        }`}
      >
        {row.original.type === "EXPENSE" ? "-" : "+"}
        {currency.format(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.paymentMethod === "CASH" ? "Cash" : "Bank Transfer"}
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) =>
      row.original.reference ? (
        <span className="text-sm tabular-nums">{row.original.reference}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

// --- Form ---

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "SALARY",
    "RENT",
    "UTILITIES",
    "TRANSPORT",
    "MATERIAL_SALE",
    "CLIENT_ADVANCE",
    "SUPPLIER_REFUND",
    "BANK_FEES",
    "OTHER_EXPENSE",
    "OTHER_INCOME",
  ]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  paymentDate: z.string().min(1, "Required"),
  description: z.string().optional(),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_PAGE_SIZE = 10;

export const GeneralPaymentsPage = () => {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleTypeChange = useCallback((value: string) => {
    setType(value);
    setCategory("");
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handlePaymentMethodChange = useCallback((value: string) => {
    setPaymentMethod(value);
    setPage(1);
  }, []);

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
    setPage(1);
  }, []);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setType("");
    setCategory("");
    setPaymentMethod("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }, []);

  const hasFilters = !!type || !!category || !!paymentMethod || !!fromDate || !!toDate;

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      type: type || undefined,
      category: category || undefined,
      paymentMethod: paymentMethod || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, type, category, paymentMethod, fromDate, toDate],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: generalPaymentKeys.list(queryParams),
    queryFn: () => getGeneralPaymentsAction(queryParams),
  });

  // Form
  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: "EXPENSE",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const watchedType = useWatch({ control, name: "type" });

  // Categories for the filter bar — filtered by the `type` filter state
  const filterCategories = GENERAL_PAYMENT_CATEGORIES.filter(
    (c) => !type || c.type === type,
  );

  // Categories for the form — filtered by the form's watched type
  const availableCategories = GENERAL_PAYMENT_CATEGORIES.filter(
    (c) => !watchedType || c.type === watchedType,
  );

  const createMutation = useMutation({
    mutationFn: recordGeneralPaymentAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: generalPaymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
      toast.success("Payment recorded successfully");
      setSheetOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      type: values.type,
      category: values.category,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      paymentDate: values.paymentDate,
      description: values.description || undefined,
      reference: values.reference || undefined,
    });
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) reset();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>General Payments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => setSheetOpen(true)}>
          <PlusIcon className="size-4" />
          Record Payment
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {GENERAL_PAYMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {filterCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">From</span>
          <Input
            type="date"
            className="w-[150px]"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">To</span>
          <Input
            type="date"
            className="w-[150px]"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <DataTable
            columns={columns}
            data={data?.payments ?? []}
            isLoading={isLoading}
            emptyMessage="No general payments found. Record your first payment to get started."
          />
          <div className="p-4 border-t bg-muted">
            <CustomPagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              itemLabel="payments"
              onPageChange={setPage}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="overflow-hidden gap-0">
          <SheetHeader className="border-b">
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>
              Register an income or expense payment.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <form
              id="general-payment-form"
              onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            >
              <FieldGroup className="gap-4">
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="type">Type</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          setValue("category", "" as never);
                        }}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENERAL_PAYMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="category">Category</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="amount">Amount</FieldLabel>
                      <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="paymentMethod">
                        Payment Method
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="paymentDate"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="paymentDate">
                        Payment Date
                      </FieldLabel>
                      <Input id="paymentDate" type="date" {...field} />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="description">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id="description"
                        placeholder="e.g. Monthly office rent"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="reference"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="reference">
                        Reference{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id="reference"
                        placeholder="e.g. TRF-001"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSheetOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="general-payment-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {createMutation.isPending ? "Saving…" : "Record Payment"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
