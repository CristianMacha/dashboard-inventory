import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, PlusIcon, Trash2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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

import { createWorkshopPurchaseOrderAction } from "@/admin/actions/create-workshop-purchase-order.action";
import { getWorkshopSuppliersAction } from "@/admin/actions/get-workshop-suppliers.action";
import { getWorkshopMaterialsSelectAction } from "@/admin/actions/get-workshop-materials-select.action";
import {
  workshopPurchaseOrderKeys,
  workshopSupplierKeys,
  workshopMaterialSelectKeys,
  procurementNeedsKeys,
} from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { CreatePurchaseOrderItemBody } from "@/interfaces/workshop-purchase-order.response";

const itemSchema = z.object({
  materialId: z.string().min(1, "Material is required"),
  materialName: z.string().min(1, "Material name is required"),
  purchaseQuantity: z.coerce.number().positive("Must be > 0"),
  requestedQuantity: z.coerce.number().min(0),
  unitCost: z.coerce.number().min(0),
});

const createPOSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type CreatePOFormValues = z.infer<typeof createPOSchema>;

const emptyValues: CreatePOFormValues = {
  supplierId: "",
  items: [{ materialId: "", materialName: "", purchaseQuantity: 0, requestedQuantity: 0, unitCost: 0 }],
  notes: "",
};

interface CreatePurchaseOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItems?: CreatePurchaseOrderItemBody[];
}

export const CreatePurchaseOrderSheet = ({
  open,
  onOpenChange,
  initialItems,
}: CreatePurchaseOrderSheetProps) => {
  const queryClient = useQueryClient();
  const handleClose = () => onOpenChange(false);

  const form = useForm<CreatePOFormValues>({
    resolver: zodResolver(createPOSchema) as Resolver<CreatePOFormValues>,
    defaultValues: emptyValues,
  });

  const { reset, control, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) {
      reset({
        ...emptyValues,
        items:
          initialItems && initialItems.length > 0
            ? initialItems
            : emptyValues.items,
      });
    }
  }, [open, initialItems, reset]);

  const { data: suppliers = [] } = useQuery({
    queryKey: workshopSupplierKeys.list(),
    queryFn: getWorkshopSuppliersAction,
  });
  const activeSuppliers = suppliers.filter((s) => s.isActive);

  const { data: materials = [] } = useQuery({
    queryKey: workshopMaterialSelectKeys.list(),
    queryFn: () => getWorkshopMaterialsSelectAction(),
  });

  const createMutation = useMutation({
    mutationFn: createWorkshopPurchaseOrderAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopPurchaseOrderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: procurementNeedsKeys.all });
      toast.success("Purchase order created");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create purchase order"));
    },
  });

  const onSubmit = (values: CreatePOFormValues) => {
    createMutation.mutate({
      supplierId: values.supplierId,
      items: values.items.map((i) => ({
        materialId: i.materialId,
        materialName: i.materialName,
        purchaseQuantity: Number(i.purchaseQuantity),
        requestedQuantity: Number(i.requestedQuantity),
        unitCost: Number(i.unitCost),
      })),
      notes: values.notes || undefined,
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>New Purchase Order</SheetTitle>
          <SheetDescription>
            Create a purchase order for workshop materials.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form id="create-po-form" onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
            <FieldGroup>
              <Controller
                control={control}
                name="supplierId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="po-supplier">Supplier</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="po-supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSuppliers.map((s) => (
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

              <FieldSeparator>Items</FieldSeparator>

              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Item {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <Controller
                    control={control}
                    name={`items.${index}.materialId`}
                    render={({ field: f, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor={`item-material-${index}`}>Material</FieldLabel>
                        {initialItems ? (
                          <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm">
                            {form.getValues(`items.${index}.materialName`)}
                          </div>
                        ) : (
                          <Select
                            value={f.value}
                            onValueChange={(v) => {
                              f.onChange(v);
                              const mat = materials.find((m) => m.id === v);
                              if (mat) setValue(`items.${index}.materialName`, mat.name);
                            }}
                          >
                            <SelectTrigger id={`item-material-${index}`}>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {fieldState.invalid && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Controller
                      control={control}
                      name={`items.${index}.purchaseQuantity`}
                      render={({ field: f, fieldState }) => (
                        <Field>
                          <FieldLabel htmlFor={`item-purchase-qty-${index}`}>Purchase Qty</FieldLabel>
                          <Input
                            id={`item-purchase-qty-${index}`}
                            {...f}
                            type="number"
                            min={0.001}
                            step="0.001"
                            placeholder="0"
                          />
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.requestedQuantity`}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel htmlFor={`item-req-qty-${index}`}>Requested Qty</FieldLabel>
                          <Input
                            id={`item-req-qty-${index}`}
                            {...f}
                            type="number"
                            readOnly
                            className="bg-muted/50"
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.unitCost`}
                      render={({ field: f }) => (
                        <Field>
                          <FieldLabel htmlFor={`item-unit-cost-${index}`}>Unit Cost</FieldLabel>
                          <Input
                            id={`item-unit-cost-${index}`}
                            {...f}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </Field>
                      )}
                    />
                  </div>
                </div>
              ))}

              {!initialItems && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      materialId: "",
                      materialName: "",
                      purchaseQuantity: 0,
                      requestedQuantity: 0,
                      unitCost: 0,
                    })
                  }
                >
                  <PlusIcon className="size-4" />
                  Add Item
                </Button>
              )}

              {form.formState.errors.items?.root && (
                <FieldError>{form.formState.errors.items.root.message}</FieldError>
              )}

              <FieldSeparator>Optional</FieldSeparator>

              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="po-notes">Notes</FieldLabel>
                    <Textarea
                      id="po-notes"
                      {...field}
                      placeholder="Any additional notes…"
                      className="min-h-[80px] resize-y"
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter className="flex-row justify-end border-t">
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-po-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Creating…" : "Create Order"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
