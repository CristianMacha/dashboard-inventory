import { Controller } from "react-hook-form";
import { z } from "zod";
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

import { createBrandAction } from "@/admin/actions/create-brand.action";
import { updateBrandAction } from "@/admin/actions/update-brand.action";
import { brandKeys } from "@/admin/queryKeys";
import { useFormSheet } from "@/admin/hooks/useFormSheet";
import type { BrandResponse } from "@/interfaces/brand.response";

const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

const emptyValues: BrandFormValues = {
  name: "",
  description: "",
};

function toFormValues(brand: BrandResponse): BrandFormValues {
  return {
    name: brand.name,
    description: brand.description ?? "",
  };
}

interface BrandFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBrand: BrandResponse | null;
}

export const BrandFormSheet = ({
  open,
  onOpenChange,
  editingBrand,
}: BrandFormSheetProps) => {
  const isEditing = !!editingBrand;
  const handleClose = () => onOpenChange(false);

  const { form, isSubmitting, onSubmit } = useFormSheet<BrandFormValues, BrandResponse>({
    open,
    editingItem: editingBrand,
    schema: brandFormSchema,
    emptyValues,
    toFormValues,
    createFn: (values) =>
      createBrandAction({
        name: values.name,
        description: values.description || undefined,
      }),
    updateFn: (id, values) =>
      updateBrandAction(id, {
        name: values.name,
        description: values.description || undefined,
      }),
    getId: (brand) => brand.id,
    createInvalidateKey: brandKeys.lists(),
    updateInvalidateKey: brandKeys.lists(),
    entityName: "Brand",
    onClose: handleClose,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Brand" : "New Brand"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the brand details."
              : "Fill in the details to create a new brand."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="brand-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="brand-name">Name</FieldLabel>
                    <Input
                      id="brand-name"
                      {...field}
                      placeholder="e.g. Cosentino"
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
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="brand-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="brand-description"
                      {...field}
                      placeholder="Optional description"
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
          <Button type="submit" form="brand-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Brand"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
