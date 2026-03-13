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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { createSupplierAction } from "@/admin/actions/create-supplier.action";
import { updateSupplierAction } from "@/admin/actions/update-supplier.action";
import { supplierKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { SupplierResponse } from "@/interfaces/supplier.response";

const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const emptyValues: SupplierFormValues = {
  name: "",
  abbreviation: "",
};

function toFormValues(supplier: SupplierResponse): SupplierFormValues {
  return {
    name: supplier.name,
    abbreviation: supplier.abbreviation ?? "",
  };
}

interface SupplierFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSupplier: SupplierResponse | null;
}

export const SupplierFormSheet = ({
  open,
  onOpenChange,
  editingSupplier,
}: SupplierFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingSupplier;

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

  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: createSupplierAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create supplier"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormValues & { isActive: boolean } }) =>
      updateSupplierAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
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
      updateMutation.mutate({
        id: editingSupplier.id,
        data: {
          ...values,
          isActive: editingSupplier.isActive,
        },
      });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>
            {isEditing ? "Edit Supplier" : "New Supplier"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the supplier details."
              : "Fill in the details to create a new supplier."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="supplier-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="supplier-name">Name</FieldLabel>
                    <Input
                      id="supplier-name"
                      {...field}
                      placeholder="e.g. Proveedor ABC"
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
                name="abbreviation"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="supplier-abbreviation">
                      Abbreviation
                    </FieldLabel>
                    <Input
                      id="supplier-abbreviation"
                      {...field}
                      placeholder="e.g. ABC"
                      autoComplete="off"
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
          <Button type="submit" form="supplier-form" disabled={isSubmitting}>
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
