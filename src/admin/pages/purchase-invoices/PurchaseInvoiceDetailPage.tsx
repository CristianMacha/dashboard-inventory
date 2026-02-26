import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Loader2,
  Plus,
  ReceiptIcon,
  Trash2,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
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
import { Skeleton } from "@/components/ui/skeleton";

import { getPurchaseInvoiceByIdAction } from "@/admin/actions/get-purchase-invoice-by-id.action";
import { createPurchaseInvoiceAction } from "@/admin/actions/create-purchase-invoice.action";
import { addInvoiceItemAction } from "@/admin/actions/add-invoice-item.action";
import { removeInvoiceItemAction } from "@/admin/actions/remove-invoice-item.action";
import { receiveInvoiceAction } from "@/admin/actions/receive-invoice.action";
import { payInvoiceAction } from "@/admin/actions/pay-invoice.action";
import { cancelInvoiceAction } from "@/admin/actions/cancel-invoice.action";
import { getActiveSuppliersAction } from "@/admin/actions/get-active-suppliers.action";
import { getBundlesAction } from "@/admin/actions/get-bundles.action";
import { purchaseInvoiceKeys, supplierKeys, bundleKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import { INVOICE_STATUS_CONFIG } from "@/lib/purchase-invoice-status";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  PurchaseInvoiceDetailResponse,
  PurchaseInvoiceStatus,
  InvoiceItemConcept,
} from "@/interfaces/purchase-invoice.response";

const ITEM_CONCEPTS: { value: InvoiceItemConcept; label: string }[] = [
  { value: "MATERIAL", label: "Material" },
  { value: "FREIGHT", label: "Freight" },
  { value: "CUSTOMS", label: "Customs" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "OTHER", label: "Other" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ─── Create form schema ──────────────────────────────────────────────────────

const createSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

// ─── Add-item sheet schema ───────────────────────────────────────────────────

const addItemSchema = z.object({
  bundleId: z.string().min(1, "Bundle is required"),
  concept: z.string().min(1, "Concept is required"),
  description: z.string().optional(),
  unitCost: z.coerce.number().min(0, "Must be >= 0"),
  quantity: z.coerce.number().int().min(1, "Must be >= 1"),
});

type AddItemFormValues = z.infer<typeof addItemSchema>;

// ─── Status action helpers ───────────────────────────────────────────────────

function getAvailableActions(status: PurchaseInvoiceStatus) {
  const actions: {
    label: string;
    variant: "default" | "destructive" | "outline";
    action: "receive" | "pay" | "cancel";
  }[] = [];

  if (status === "DRAFT") {
    actions.push({ label: "Mark as Received", variant: "default", action: "receive" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }
  if (status === "RECEIVED" || status === "PARTIALLY_PAID") {
    actions.push({ label: "Mark as Paid", variant: "default", action: "pay" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }

  return actions;
}

// ─── Create Mode ─────────────────────────────────────────────────────────────

function CreateInvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: supplierKeys.active,
    queryFn: getActiveSuppliersAction,
  });

  const { control, handleSubmit } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      invoiceNumber: "",
      supplierId: "",
      invoiceDate: "",
      dueDate: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createPurchaseInvoiceAction,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      toast.success("Invoice created successfully");
      void navigate(`/purchase-invoices/${result.id}`);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create invoice");
    },
  });

  const onSubmit = (values: CreateFormValues) => {
    mutation.mutate({
      ...values,
      dueDate: values.dueDate || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/purchase-invoices">Purchase Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Invoice</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ReceiptIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">New Purchase Invoice</h1>
          <p className="text-sm text-muted-foreground">
            Create a new purchase invoice for a supplier
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="invoiceNumber"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="invoiceNumber">Invoice Number</FieldLabel>
                      <Input
                        id="invoiceNumber"
                        {...field}
                        placeholder="e.g. INV-2026-001"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="supplierId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="supplierId">
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
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
                  name="invoiceDate"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
                      <Input id="invoiceDate" type="date" {...field} />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="dueDate">
                        Due Date <span className="font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <Input id="dueDate" type="date" {...field} />
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="notes">
                      Notes <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      id="notes"
                      {...field}
                      placeholder="Additional notes about this invoice…"
                      rows={3}
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" asChild>
                <Link to="/purchase-invoices">Cancel</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {mutation.isPending ? "Creating…" : "Create Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Detail Mode ─────────────────────────────────────────────────────────────

function InvoiceDetail({ invoice }: { invoice: PurchaseInvoiceDetailResponse }) {
  const queryClient = useQueryClient();
  const [itemSheetOpen, setItemSheetOpen] = useState(false);

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
  const actions = getAvailableActions(invoice.status);

  const statusMutation = useMutation({
    mutationFn: async (action: "receive" | "pay" | "cancel") => {
      if (action === "receive") return receiveInvoiceAction(invoice.id);
      if (action === "pay") return payInvoiceAction(invoice.id);
      return cancelInvoiceAction(invoice.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.detail(invoice.id) });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoiceKeys.lists() });
      toast.success("Invoice status updated");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update status");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeInvoiceItemAction(invoice.id, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: purchaseInvoiceKeys.detail(invoice.id),
      });
      toast.success("Item removed");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to remove item");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/purchase-invoices">Purchase Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {invoice.invoiceNumber}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ReceiptIcon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">
                {invoice.invoiceNumber}
              </h1>
              <StatusBadge label={statusConfig.label} className={statusConfig.className} />
            </div>
            {invoice.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {invoice.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" asChild>
            <Link to="/purchase-invoices">
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
          {actions.map((a) => {
            const isThisActionPending =
              statusMutation.isPending && statusMutation.variables === a.action;
            return (
              <Button
                key={a.action}
                variant={a.variant}
                onClick={() => statusMutation.mutate(a.action)}
                disabled={statusMutation.isPending}
              >
                {isThisActionPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {a.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Info strip */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            <InfoItem
              label="Invoice Date"
              value={formatDate(invoice.invoiceDate)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Due Date"
              value={invoice.dueDate ? formatDate(invoice.dueDate) : undefined}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem label="Subtotal" value={currency.format(invoice.subtotal)} />
            <InfoItem label="Tax" value={currency.format(invoice.taxAmount)} />
            <InfoItem label="Total" value={currency.format(invoice.totalAmount)} />
            <InfoItem label="Items" value={String(invoice.itemCount)} />
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* Items section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Invoice Items</h2>
          <p className="text-sm text-muted-foreground">
            {invoice.items.length === 0
              ? "No items added to this invoice yet"
              : `${invoice.items.length} item${invoice.items.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {invoice.status === "DRAFT" && (
          <Button onClick={() => setItemSheetOpen(true)}>
            <Plus className="size-4" />
            Add Item
          </Button>
        )}
      </div>

      {invoice.items.length > 0 && (
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Concept</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                    <TableHead className="font-semibold text-right">Qty</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    {invoice.status === "DRAFT" && (
                      <TableHead className="w-[50px]" />
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <StatusBadge
                          label={item.concept}
                          className="bg-secondary text-secondary-foreground ring-1 ring-border"
                        />
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.description ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {currency.format(item.unitCost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-sm">
                        {currency.format(item.totalCost)}
                      </TableCell>
                      {invoice.status === "DRAFT" && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMutation.mutate(item.id)}
                            disabled={removeMutation.isPending}
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddItemSheet
        invoiceId={invoice.id}
        open={itemSheetOpen}
        onOpenChange={setItemSheetOpen}
      />
    </div>
  );
}

// ─── Add Item Sheet ──────────────────────────────────────────────────────────

function AddItemSheet({
  invoiceId,
  open,
  onOpenChange,
}: {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: bundlesData } = useQuery({
    queryKey: bundleKeys.list({ page: 1, limit: 100 }),
    queryFn: () => getBundlesAction({ page: 1, limit: 100 }),
    enabled: open,
  });

  const { control, handleSubmit, reset, setValue, getValues } = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      bundleId: "",
      concept: "",
      description: "",
      unitCost: 0,
      quantity: 1,
    },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: AddItemFormValues) =>
      addInvoiceItemAction(invoiceId, {
        bundleId: values.bundleId,
        concept: values.concept as InvoiceItemConcept,
        description: values.description || undefined,
        unitCost: values.unitCost,
        quantity: values.quantity,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: purchaseInvoiceKeys.detail(invoiceId),
      });
      toast.success("Item added");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to add item");
    },
  });

  const onSubmit = (values: AddItemFormValues) => mutation.mutate(values);
  const bundles = bundlesData?.data ?? [];

  const handleBundleChange = (bundleId: string, onChange: (v: string) => void) => {
    const prevBundleId = getValues("bundleId");
    const currentDesc = getValues("description");
    const prevBundle = bundles.find((b) => b.id === prevBundleId);
    const prevAutoDesc = prevBundle
      ? prevBundle.lotNumber
        ? `${prevBundle.productName} - LOT ${prevBundle.lotNumber}`
        : prevBundle.productName
      : "";

    onChange(bundleId);

    // Auto-fill if description is empty or still matches the previous auto-generated value
    if (!currentDesc || currentDesc === prevAutoDesc) {
      const bundle = bundles.find((b) => b.id === bundleId);
      if (bundle) {
        const desc = bundle.lotNumber
          ? `${bundle.productName} - LOT ${bundle.lotNumber}`
          : bundle.productName;
        setValue("description", desc);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle>Add Invoice Item</SheetTitle>
          <SheetDescription>
            Link a bundle to this invoice with a cost concept
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-item-form"
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="bundleId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="bundleId">Bundle</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => handleBundleChange(v, field.onChange)}
                  >
                    <SelectTrigger id="bundleId">
                      <SelectValue placeholder="Select a bundle" />
                    </SelectTrigger>
                    <SelectContent>
                      {bundles.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.lotNumber ?? b.id.slice(0, 8)} — {b.productName}
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
              name="concept"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="concept">Concept</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="concept">
                      <SelectValue placeholder="Select a concept" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CONCEPTS.map((c) => (
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
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="item-desc">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="item-desc"
                    {...field}
                    placeholder="e.g. Granito Blanco Polar - Bundle LOT-001"
                  />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="unitCost"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="unitCost">Unit Cost</FieldLabel>
                    <Input
                      id="unitCost"
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="quantity"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-item-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Adding…" : "Add Item"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <dt className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </dt>
      <dd className="text-sm font-semibold flex items-center gap-1">
        {icon}
        {value ?? <span className="text-muted-foreground font-normal">—</span>}
      </dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export const PurchaseInvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: purchaseInvoiceKeys.detail(id ?? ""),
    queryFn: () => getPurchaseInvoiceByIdAction(id!),
    enabled: !isNew && !!id,
  });

  const handleNotFound = useCallback(() => {
    void navigate("/purchase-invoices", { replace: true });
  }, [navigate]);

  if (isNew) return <CreateInvoiceForm />;
  if (isLoading) return <DetailSkeleton />;
  if (isError || !invoice) {
    handleNotFound();
    return null;
  }

  return <InvoiceDetail invoice={invoice} />;
};
