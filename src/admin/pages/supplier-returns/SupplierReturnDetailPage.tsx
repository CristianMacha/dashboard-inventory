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
  Package2Icon,
  Plus,
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
import { Card, CardContent } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/ui/status-badge";

import { getSupplierReturnByIdAction } from "@/admin/actions/get-supplier-return-by-id.action";
import { createSupplierReturnAction } from "@/admin/actions/create-supplier-return.action";
import { addReturnItemAction } from "@/admin/actions/add-return-item.action";
import { removeReturnItemAction } from "@/admin/actions/remove-return-item.action";
import { sendSupplierReturnAction } from "@/admin/actions/send-supplier-return.action";
import { creditSupplierReturnAction } from "@/admin/actions/credit-supplier-return.action";
import { cancelSupplierReturnAction } from "@/admin/actions/cancel-supplier-return.action";
import { getActiveSuppliersAction } from "@/admin/actions/get-active-suppliers.action";
import { getSlabsAction } from "@/admin/actions/get-slabs.action";
import { getPurchaseInvoicesForSelectAction } from "@/admin/actions/get-purchase-invoices-for-select.action";
import { supplierReturnKeys, supplierKeys, slabKeys, purchaseInvoiceKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import { RETURN_STATUS_CONFIG } from "@/lib/supplier-return-status";
import { formatDate } from "@/lib/format";
import type {
  SupplierReturnDetailResponse,
  SupplierReturnStatus,
  ReturnItemReason,
} from "@/interfaces/supplier-return.response";

const RETURN_ITEM_REASONS: { value: ReturnItemReason; label: string }[] = [
  { value: "DEFECTIVE", label: "Defective" },
  { value: "BROKEN", label: "Broken" },
  { value: "WRONG_ITEM", label: "Wrong Item" },
  { value: "OTHER", label: "Other" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ─── Status action helpers ───────────────────────────────────────────────────

function getAvailableActions(status: SupplierReturnStatus) {
  const actions: {
    label: string;
    variant: "default" | "destructive" | "outline";
    action: "send" | "credit" | "cancel";
  }[] = [];

  if (status === "DRAFT") {
    actions.push({ label: "Send to Supplier", variant: "default", action: "send" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }
  if (status === "SENT") {
    actions.push({ label: "Mark as Credited", variant: "default", action: "credit" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }

  return actions;
}

// ─── Create form schema ──────────────────────────────────────────────────────

const createSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseInvoiceId: z.string().min(1, "Purchase invoice ID is required"),
  returnDate: z.string().min(1, "Return date is required"),
  notes: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

// ─── Add-item sheet schema ───────────────────────────────────────────────────

const addItemSchema = z.object({
  slabId: z.string().min(1, "Slab is required"),
  bundleId: z.string().min(1, "Bundle is required"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
  unitCost: z.coerce.number().min(0, "Must be >= 0"),
});

type AddItemFormValues = z.infer<typeof addItemSchema>;

// ─── Create Mode ─────────────────────────────────────────────────────────────

function CreateReturnForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: supplierKeys.active,
    queryFn: getActiveSuppliersAction,
  });

  const { control, handleSubmit, watch, setValue } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      supplierId: "",
      purchaseInvoiceId: "",
      returnDate: "",
      notes: "",
    },
  });

  const watchedSupplierId = watch("supplierId");

  const { data: invoices = [] } = useQuery({
    queryKey: purchaseInvoiceKeys.select({ supplierId: watchedSupplierId || undefined }),
    queryFn: () => getPurchaseInvoicesForSelectAction({ supplierId: watchedSupplierId || undefined }),
    enabled: !!watchedSupplierId,
  });

  const mutation = useMutation({
    mutationFn: createSupplierReturnAction,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: supplierReturnKeys.lists() });
      toast.success("Supplier return created");
      void navigate(`/purchasing/supplier-returns/${result.id}`);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create return");
    },
  });

  const onSubmit = (values: CreateFormValues) => {
    mutation.mutate({
      supplierId: values.supplierId,
      purchaseInvoiceId: values.purchaseInvoiceId,
      returnDate: values.returnDate,
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
              <Link to="/purchasing/supplier-returns">Supplier Returns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Return</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package2Icon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">New Supplier Return</h1>
          <p className="text-sm text-muted-foreground">
            Register a return of defective or damaged slabs to a supplier
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
                  name="supplierId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("purchaseInvoiceId", "");
                        }}
                      >
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
                  name="purchaseInvoiceId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="purchaseInvoiceId">Purchase Invoice</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!watchedSupplierId || invoices.length === 0}
                      >
                        <SelectTrigger id="purchaseInvoiceId">
                          <SelectValue
                            placeholder={
                              !watchedSupplierId
                                ? "Select a supplier first"
                                : invoices.length === 0
                                ? "No invoices for this supplier"
                                : "Select a purchase invoice"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.invoiceNumber} — {formatDate(inv.invoiceDate)}
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
                  name="returnDate"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="returnDate">Return Date</FieldLabel>
                      <Input id="returnDate" type="date" {...field} />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
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
                      Notes{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      id="notes"
                      {...field}
                      placeholder="Additional notes about this return…"
                      rows={3}
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" asChild>
                <Link to="/purchasing/supplier-returns">Cancel</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {mutation.isPending ? "Creating…" : "Create Return"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Detail Mode ─────────────────────────────────────────────────────────────

function ReturnDetail({ supplierReturn }: { supplierReturn: SupplierReturnDetailResponse }) {
  const queryClient = useQueryClient();
  const [slabSheetOpen, setSlabSheetOpen] = useState(false);

  const statusConfig = RETURN_STATUS_CONFIG[supplierReturn.status];
  const actions = getAvailableActions(supplierReturn.status);

  const statusMutation = useMutation({
    mutationFn: async (action: "send" | "credit" | "cancel") => {
      if (action === "send") return sendSupplierReturnAction(supplierReturn.id);
      if (action === "credit") return creditSupplierReturnAction(supplierReturn.id);
      return cancelSupplierReturnAction(supplierReturn.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supplierReturnKeys.detail(supplierReturn.id),
      });
      void queryClient.invalidateQueries({ queryKey: supplierReturnKeys.lists() });
      toast.success("Return status updated");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update status");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeReturnItemAction(supplierReturn.id, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supplierReturnKeys.detail(supplierReturn.id),
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
              <Link to="/purchasing/supplier-returns">Supplier Returns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {supplierReturn.id.slice(0, 8)}…
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package2Icon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">
                Supplier Return
              </h1>
              <StatusBadge label={statusConfig.label} className={statusConfig.className} />
            </div>
            {supplierReturn.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {supplierReturn.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" asChild>
            <Link to="/purchasing/supplier-returns">
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
              label="Return Date"
              value={formatDate(supplierReturn.returnDate)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Created"
              value={formatDate(supplierReturn.createdAt)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem label="Credit Amount" value={currency.format(supplierReturn.creditAmount)} />
            <InfoItem label="Items" value={String(supplierReturn.items.length)} />
            {supplierReturn.notes && (
              <InfoItem label="Notes" value={supplierReturn.notes} />
            )}
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* Items section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Return Items</h2>
          <p className="text-sm text-muted-foreground">
            {supplierReturn.items.length === 0
              ? "No slabs added to this return yet"
              : `${supplierReturn.items.length} slab${supplierReturn.items.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {supplierReturn.status === "DRAFT" && (
          <Button onClick={() => setSlabSheetOpen(true)}>
            <Plus className="size-4" />
            Add Slab
          </Button>
        )}
      </div>

      {supplierReturn.items.length > 0 && (
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Slab ID</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    {supplierReturn.status === "DRAFT" && (
                      <TableHead className="w-[50px]" />
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierReturn.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm tabular-nums font-mono">
                        {item.slabId.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={item.reason}
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
                      <TableCell className="text-right tabular-nums font-medium text-sm">
                        {currency.format(item.totalCost)}
                      </TableCell>
                      {supplierReturn.status === "DRAFT" && (
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

      <AddSlabSheet
        returnId={supplierReturn.id}
        open={slabSheetOpen}
        onOpenChange={setSlabSheetOpen}
      />
    </div>
  );
}

// ─── Add Slab Sheet ──────────────────────────────────────────────────────────

function AddSlabSheet({
  returnId,
  open,
  onOpenChange,
}: {
  returnId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: slabsData } = useQuery({
    queryKey: slabKeys.list({ page: 1, limit: 100 }),
    queryFn: () => getSlabsAction({ page: 1, limit: 100 }),
    enabled: open,
  });

  const { control, handleSubmit, reset, watch } = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      slabId: "",
      bundleId: "",
      reason: "",
      description: "",
      unitCost: 0,
    },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  // Auto-fill bundleId when slab is selected
  const selectedSlabId = watch("slabId");
  const slabs = slabsData?.data ?? [];

  useEffect(() => {
    if (selectedSlabId) {
      const slab = slabs.find((s) => s.id === selectedSlabId);
      if (slab) {
        // bundleId comes from the slab
        reset((prev) => ({ ...prev, slabId: selectedSlabId, bundleId: slab.bundleId }));
      }
    }
  }, [selectedSlabId, slabs, reset]);

  const mutation = useMutation({
    mutationFn: (values: AddItemFormValues) =>
      addReturnItemAction(returnId, {
        slabId: values.slabId,
        bundleId: values.bundleId,
        reason: values.reason as ReturnItemReason,
        description: values.description || undefined,
        unitCost: values.unitCost,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supplierReturnKeys.detail(returnId),
      });
      toast.success("Slab added");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to add slab");
    },
  });

  const onSubmit = (values: AddItemFormValues) => mutation.mutate(values);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle>Add Slab to Return</SheetTitle>
          <SheetDescription>
            Select a slab and provide return details
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-slab-form"
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="slabId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="slabId">Slab</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="slabId">
                      <SelectValue placeholder="Select a slab" />
                    </SelectTrigger>
                    <SelectContent>
                      {slabs.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code}
                          {s.description ? ` — ${s.description}` : ""}
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
              name="reason"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="reason">Reason</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_ITEM_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
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
                    placeholder="e.g. Crack on the lower edge…"
                  />
                </Field>
              )}
            />

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
          <Button type="submit" form="add-slab-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Adding…" : "Add Slab"}
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

export const SupplierReturnDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const {
    data: supplierReturn,
    isLoading,
    isError,
  } = useQuery({
    queryKey: supplierReturnKeys.detail(id ?? ""),
    queryFn: () => getSupplierReturnByIdAction(id!),
    enabled: !isNew && !!id,
  });

  const handleNotFound = useCallback(() => {
    void navigate("/purchasing/supplier-returns", { replace: true });
  }, [navigate]);

  if (isNew) return <CreateReturnForm />;
  if (isLoading) return <DetailSkeleton />;
  if (isError || !supplierReturn) {
    handleNotFound();
    return null;
  }

  return <ReturnDetail supplierReturn={supplierReturn} />;
};
