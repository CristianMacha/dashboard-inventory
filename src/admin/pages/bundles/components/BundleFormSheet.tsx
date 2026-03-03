import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Controller,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import { updateBundleAction } from "@/admin/actions/update-bundle.action";
import { linkBundleInvoiceAction } from "@/admin/actions/link-bundle-invoice.action";
import { createBundleWithSlabsAction } from "@/admin/actions/create-bundle-with-slabs.action";
import { getProductsAction } from "@/admin/actions/get-products.action";
import { getActiveSuppliersAction } from "@/admin/actions/get-active-suppliers.action";
import { getPurchaseInvoicesForSelectAction } from "@/admin/actions/get-purchase-invoices-for-select.action";
import { bundleKeys, productKeys, purchaseInvoiceKeys, slabKeys, summaryKeys, supplierKeys } from "@/admin/queryKeys";
import type { BundleResponse } from "@/interfaces/bundle.response";

const slabSchema = z.object({
  code: z.string().min(1, "Code is required"),
  widthCm: z.coerce.number().positive("Must be > 0"),
  heightCm: z.coerce.number().positive("Must be > 0"),
  description: z.string().optional(),
});

const bundleFormSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    linkMode: z.enum(["invoice", "supplier"]),
    purchaseInvoiceId: z.string().optional(),
    supplierId: z.string().optional(),
    lotNumber: z.string().optional(),
    thicknessCm: z.coerce.number().min(0).optional().or(z.literal("")),
    slabs: z.array(slabSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.linkMode === "invoice" && !data.purchaseInvoiceId) {
      ctx.addIssue({ code: "custom", path: ["purchaseInvoiceId"], message: "Purchase invoice is required" });
    }
    if (data.linkMode === "supplier" && !data.supplierId) {
      ctx.addIssue({ code: "custom", path: ["supplierId"], message: "Supplier is required" });
    }
  });

type BundleFormValues = z.infer<typeof bundleFormSchema>;

const emptyValues: BundleFormValues = {
  productId: "",
  linkMode: "invoice",
  purchaseInvoiceId: "",
  supplierId: "",
  lotNumber: "",
  thicknessCm: "",
  slabs: [],
};

function toFormValues(bundle: BundleResponse): BundleFormValues {
  return {
    productId: bundle.productId,
    linkMode: bundle.purchaseInvoiceId ? "invoice" : "supplier",
    purchaseInvoiceId: bundle.purchaseInvoiceId ?? "",
    supplierId: bundle.supplierId,
    lotNumber: bundle.lotNumber ?? "",
    thicknessCm: bundle.thicknessCm ?? "",
    slabs: [],
  };
}

/** Converts an empty string or nullish value to undefined for optional numeric fields. */
function emptyToUndefined(value: number | "" | null | undefined): number | undefined {
  return value !== "" && value != null ? Number(value) : undefined;
}

interface BundleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBundle: BundleResponse | null;
  prefilledProduct?: { id: string; name: string };
}

export const BundleFormSheet = ({
  open,
  onOpenChange,
  editingBundle,
  prefilledProduct,
}: BundleFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingBundle;
  const isProductPrefilled = !!prefilledProduct;

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: productKeys.list({ page: 1, limit: 100 }),
    queryFn: () => getProductsAction({ page: 1, limit: 100 }),
    enabled: open,
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: supplierKeys.active,
    queryFn: getActiveSuppliersAction,
    enabled: open,
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: purchaseInvoiceKeys.select({}),
    queryFn: () => getPurchaseInvoicesForSelectAction(),
    enabled: open,
  });

  const { control, handleSubmit, reset, watch, setValue } = useForm<BundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: emptyValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slabs",
  });

  const linkMode = watch("linkMode");

  useEffect(() => {
    if (open) {
      if (isEditing) {
        reset(toFormValues(editingBundle));
      } else {
        reset({
          ...emptyValues,
          productId: prefilledProduct?.id ?? "",
        });
      }
    }
  }, [open, editingBundle, isEditing, prefilledProduct, reset]);

  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: createBundleWithSlabsAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bundleKeys.all });
      void queryClient.invalidateQueries({ queryKey: slabKeys.all });
      void queryClient.invalidateQueries({ queryKey: summaryKeys.all });
      toast.success("Bundle created successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create bundle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BundleFormValues }) => {
      await updateBundleAction(id, {
        lotNumber: data.lotNumber || undefined,
        thicknessCm: emptyToUndefined(data.thicknessCm),
      });
      // Link invoice if mode changed to invoice and an invoice was selected
      if (data.linkMode === "invoice" && data.purchaseInvoiceId) {
        await linkBundleInvoiceAction(id, data.purchaseInvoiceId);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bundleKeys.all });
      toast.success("Bundle updated successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update bundle");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const products = productsData?.data ?? [];

  const onSubmit = (values: BundleFormValues) => {
    if (isEditing) {
      updateMutation.mutate({ id: editingBundle.id, data: values });
    } else {
      createMutation.mutate({
        productId: values.productId,
        ...(values.linkMode === "invoice"
          ? { purchaseInvoiceId: values.purchaseInvoiceId }
          : { supplierId: values.supplierId }),
        lotNumber: values.lotNumber || undefined,
        thicknessCm: emptyToUndefined(values.thicknessCm),
        slabs: values.slabs.map((s) => ({
          code: s.code,
          widthCm: Number(s.widthCm),
          heightCm: Number(s.heightCm),
          description: s.description || undefined,
        })),
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={`overflow-hidden gap-0 ${isEditing ? "" : "sm:max-w-xl"}`}
      >
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Bundle" : "New Bundle"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? editingBundle?.purchaseInvoiceId
                ? "Lot number and thickness can be updated. Product and supplier are locked."
                : "Lot number, thickness and purchase invoice can be updated. Supplier is locked."
              : isProductPrefilled
                ? `Creating bundle for "${prefilledProduct?.name ?? ""}". Link to a purchase invoice or select a supplier directly.`
                : "Select a product, link to a purchase invoice or supplier, then optionally add slabs."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="bundle-form"
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            {/* Product */}
            {isProductPrefilled ? (
              <Field>
                <FieldLabel>Product</FieldLabel>
                <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                  {prefilledProduct?.name}
                </div>
              </Field>
            ) : (
              <Controller
                control={control}
                name="productId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="productId">Product</FieldLabel>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      disabled={isLoadingProducts || isEditing}
                    >
                      <SelectTrigger id="productId">
                        <SelectValue
                          placeholder={
                            isLoadingProducts
                              ? "Loading products…"
                              : "Select a product"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
            )}

            {/* Link mode toggle — on create, or on edit when no invoice yet */}
            {(!isEditing || !editingBundle?.purchaseInvoiceId) && (
              <Controller
                control={control}
                name="linkMode"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Link to</FieldLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={field.value === "invoice" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => {
                          field.onChange("invoice");
                          setValue("supplierId", "");
                        }}
                      >
                        Purchase Invoice
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "supplier" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => {
                          field.onChange("supplier");
                          setValue("purchaseInvoiceId", "");
                        }}
                      >
                        Supplier only
                      </Button>
                    </div>
                  </Field>
                )}
              />
            )}

            {/* Purchase Invoice select */}
            {(!isEditing || !editingBundle?.purchaseInvoiceId) && linkMode === "invoice" && (
              <Controller
                control={control}
                name="purchaseInvoiceId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="purchaseInvoiceId">Purchase Invoice</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingInvoices}
                    >
                      <SelectTrigger id="purchaseInvoiceId">
                        <SelectValue
                          placeholder={
                            isLoadingInvoices ? "Loading invoices…" : "Select a purchase invoice"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            {inv.invoiceNumber}
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
            )}

            {/* Supplier select */}
            {(isEditing || linkMode === "supplier") && (
              <Controller
                control={control}
                name="supplierId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingSuppliers || isEditing}
                    >
                      <SelectTrigger id="supplierId">
                        <SelectValue
                          placeholder={
                            isLoadingSuppliers ? "Loading suppliers…" : "Select a supplier"
                          }
                        />
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
            )}

            <FieldSeparator>Optional</FieldSeparator>

            {/* Lot Number */}
            <Controller
              control={control}
              name="lotNumber"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="lotNumber">Lot Number</FieldLabel>
                  <Input
                    id="lotNumber"
                    {...field}
                    placeholder="e.g. LOT-2024-001"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {/* Thickness */}
            <Controller
              control={control}
              name="thicknessCm"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="thicknessCm">Thickness (cm)</FieldLabel>
                  <Input
                    id="thicknessCm"
                    type="number"
                    min={0}
                    step="0.1"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g. 2.0"
                  />
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {/* Slabs section — create mode only */}
            {!isEditing && (
              <>
                <FieldSeparator>Slabs</FieldSeparator>

                {fields.length === 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      append({ code: "", widthCm: 0, heightCm: 0, description: "" })
                    }
                    className="w-full rounded-lg border border-dashed p-5 text-center transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      No slabs added
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click to add the first slab, or leave empty and register them later.
                    </p>
                  </button>
                ) : (
                  <>
                  <div className="flex flex-col gap-3">
                    {fields.map((fieldItem, index) => (
                      <div
                        key={fieldItem.id}
                        className="rounded-lg border bg-muted/30 p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Slab {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                            aria-label={`Remove slab ${index + 1}`}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>

                        <Controller
                          control={control}
                          name={`slabs.${index}.code`}
                          render={({ field, fieldState }) => (
                            <Field>
                              <FieldLabel htmlFor={`slab-code-${index}`}>
                                Code
                              </FieldLabel>
                              <Input
                                id={`slab-code-${index}`}
                                {...field}
                                placeholder="e.g. SLB-001"
                                autoComplete="off"
                              />
                              {fieldState.invalid && (
                                <FieldError>
                                  {fieldState.error?.message}
                                </FieldError>
                              )}
                            </Field>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <Controller
                            control={control}
                            name={`slabs.${index}.widthCm`}
                            render={({ field, fieldState }) => (
                              <Field>
                                <FieldLabel htmlFor={`slab-w-${index}`}>
                                  Width (cm)
                                </FieldLabel>
                                <Input
                                  id={`slab-w-${index}`}
                                  type="number"
                                  min={0}
                                  step="0.1"
                                  {...field}
                                  placeholder="120.5"
                                />
                                {fieldState.invalid && (
                                  <FieldError>
                                    {fieldState.error?.message}
                                  </FieldError>
                                )}
                              </Field>
                            )}
                          />
                          <Controller
                            control={control}
                            name={`slabs.${index}.heightCm`}
                            render={({ field, fieldState }) => (
                              <Field>
                                <FieldLabel htmlFor={`slab-h-${index}`}>
                                  Height (cm)
                                </FieldLabel>
                                <Input
                                  id={`slab-h-${index}`}
                                  type="number"
                                  min={0}
                                  step="0.1"
                                  {...field}
                                  placeholder="240.0"
                                />
                                {fieldState.invalid && (
                                  <FieldError>
                                    {fieldState.error?.message}
                                  </FieldError>
                                )}
                              </Field>
                            )}
                          />
                        </div>

                        <Controller
                          control={control}
                          name={`slabs.${index}.description`}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel htmlFor={`slab-desc-${index}`}>
                                Description{" "}
                                <span className="font-normal text-muted-foreground">
                                  (optional)
                                </span>
                              </FieldLabel>
                              <Input
                                id={`slab-desc-${index}`}
                                {...field}
                                placeholder="e.g. No visible defects"
                              />
                            </Field>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      append({ code: "", widthCm: 0, heightCm: 0, description: "" })
                    }
                  >
                    <Plus className="size-4" />
                    Add Slab
                  </Button>
                  </>
                )}
              </>
            )}
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="bundle-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Bundle"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
