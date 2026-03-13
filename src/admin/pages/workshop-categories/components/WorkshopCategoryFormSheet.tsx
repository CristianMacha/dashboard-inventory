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

import { createWorkshopCategoryAction } from "@/admin/actions/create-workshop-category.action";
import { updateWorkshopCategoryAction } from "@/admin/actions/update-workshop-category.action";
import { workshopCategoryKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopCategoryResponse } from "@/interfaces/workshop-category.response";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const emptyValues: CategoryFormValues = {
  name: "",
  description: "",
};

function toFormValues(category: WorkshopCategoryResponse): CategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? "",
  };
}

interface WorkshopCategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: WorkshopCategoryResponse | null;
}

export const WorkshopCategoryFormSheet = ({
  open,
  onOpenChange,
  editingCategory,
}: WorkshopCategoryFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingCategory;
  const handleClose = () => onOpenChange(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingCategory ? toFormValues(editingCategory) : emptyValues);
    }
  }, [open, editingCategory, reset]);

  const createMutation = useMutation({
    mutationFn: createWorkshopCategoryAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopCategoryKeys.lists() });
      toast.success("Category created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create category"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      updateWorkshopCategoryAction(id, {
        name: data.name,
        description: data.description || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopCategoryKeys.lists() });
      toast.success("Category updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: CategoryFormValues) => {
    if (isEditing && editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values });
    } else {
      createMutation.mutate({
        name: values.name,
        description: values.description || undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Category" : "New Category"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the category details."
              : "Fill in the details to create a new workshop category."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="workshop-category-form"
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
                      placeholder="e.g. Power Tools"
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
                    <FieldLabel htmlFor="category-description">Description</FieldLabel>
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
          <Button type="submit" form="workshop-category-form" disabled={isSubmitting}>
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
