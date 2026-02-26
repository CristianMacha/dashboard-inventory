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

import { createCategoryAction } from "@/admin/actions/create-category.action";
import { updateCategoryAction } from "@/admin/actions/update-category.action";
import { categoryKeys } from "@/admin/queryKeys";
import { useFormSheet } from "@/admin/hooks/useFormSheet";
import type { CategoryResponse } from "@/interfaces/category.response";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const emptyValues: CategoryFormValues = {
  name: "",
  abbreviation: "",
  description: "",
};

function toFormValues(category: CategoryResponse): CategoryFormValues {
  return {
    name: category.name,
    abbreviation: category.abbreviation ?? "",
    description: category.description ?? "",
  };
}

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: CategoryResponse | null;
}

export const CategoryFormSheet = ({
  open,
  onOpenChange,
  editingCategory,
}: CategoryFormSheetProps) => {
  const isEditing = !!editingCategory;
  const handleClose = () => onOpenChange(false);

  const { form, isSubmitting, onSubmit } = useFormSheet<CategoryFormValues, CategoryResponse>({
    open,
    editingItem: editingCategory,
    schema: categoryFormSchema,
    emptyValues,
    toFormValues,
    createFn: (values) =>
      createCategoryAction({
        name: values.name,
        abbreviation: values.abbreviation || undefined,
        description: values.description || undefined,
      }),
    updateFn: (id, values) =>
      updateCategoryAction(id, {
        name: values.name,
        abbreviation: values.abbreviation || undefined,
        description: values.description || undefined,
      }),
    getId: (category) => category.id,
    createInvalidateKey: categoryKeys.lists(),
    updateInvalidateKey: categoryKeys.lists(),
    entityName: "Category",
    onClose: handleClose,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>
            {isEditing ? "Edit Category" : "New Category"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the category details."
              : "Fill in the details to create a new category."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="category-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="category-name">Name</FieldLabel>
                    <Input
                      id="category-name"
                      {...field}
                      placeholder="e.g. Granite"
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
                name="abbreviation"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="category-abbreviation">
                      Abbreviation
                    </FieldLabel>
                    <Input
                      id="category-abbreviation"
                      {...field}
                      placeholder="e.g. GR"
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
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="category-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="category-description"
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
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
