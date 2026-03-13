import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import { createWorkshopSupplierAction } from "@/admin/actions/create-workshop-supplier.action";
import { updateWorkshopSupplierAction } from "@/admin/actions/update-workshop-supplier.action";
import { workshopSupplierKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopSupplierResponse } from "@/interfaces/workshop-supplier.response";

const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const emptyValues: SupplierFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function toFormValues(supplier: WorkshopSupplierResponse): SupplierFormValues {
  return {
    name: supplier.name,
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    notes: supplier.notes ?? "",
  };
}

interface WorkshopSupplierFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier: WorkshopSupplierResponse | null;
}

export const WorkshopSupplierFormSheet = ({
  open,
  onOpenChange,
  editingSupplier,
}: WorkshopSupplierFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingSupplier;
  const handleClose = () => onOpenChange(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingSupplier ? toFormValues(editingSupplier) : emptyValues);
    }
  }, [open, editingSupplier, reset]);

  const createMutation = useMutation({
    mutationFn: createWorkshopSupplierAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopSupplierKeys.lists() });
      toast.success("Supplier created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create supplier"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormValues }) =>
      updateWorkshopSupplierAction(id, {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopSupplierKeys.lists() });
      toast.success("Supplier updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update supplier"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: SupplierFormValues) => {
    if (isEditing && editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: values });
    } else {
      createMutation.mutate({
        name: values.name,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Supplier" : "New Supplier"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the supplier details."
              : "Fill in the details to create a new workshop supplier."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="workshop-supplier-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="ws-supplier-name">Name</FieldLabel>
                    <Input
                      id="ws-supplier-name"
                      {...field}
                      placeholder="e.g. Tool Supply Co."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <FieldSeparator>Optional</FieldSeparator>

              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="ws-supplier-phone">Phone</FieldLabel>
                    <Input
                      id="ws-supplier-phone"
                      {...field}
                      placeholder="e.g. +1 555-0100"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="ws-supplier-email">Email</FieldLabel>
                    <Input
                      id="ws-supplier-email"
                      {...field}
                      type="email"
                      placeholder="e.g. contact@supplier.com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="ws-supplier-address">Address</FieldLabel>
                    <Input
                      id="ws-supplier-address"
                      {...field}
                      placeholder="e.g. 123 Main St"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="ws-supplier-notes">Notes</FieldLabel>
                    <Textarea
                      id="ws-supplier-notes"
                      {...field}
                      placeholder="Optional notes"
                      className="min-h-[80px] resize-y"
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
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="workshop-supplier-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Supplier"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
