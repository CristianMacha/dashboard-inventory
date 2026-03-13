import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, type Resolver } from "react-hook-form";
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

import { createWorkshopToolAction } from "@/admin/actions/create-workshop-tool.action";
import { updateWorkshopToolAction } from "@/admin/actions/update-workshop-tool.action";
import { getWorkshopCategoriesAction } from "@/admin/actions/get-workshop-categories.action";
import { getWorkshopSuppliersAction } from "@/admin/actions/get-workshop-suppliers.action";
import { workshopToolKeys, workshopCategoryKeys, workshopSupplierKeys } from "@/admin/queryKeys";
import { WorkshopToolImageUpload } from "@/admin/components/WorkshopToolImageUpload";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopToolResponse } from "@/interfaces/workshop-tool.response";

const toolFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal("")),
});

type ToolFormValues = z.infer<typeof toolFormSchema>;

const emptyValues: ToolFormValues = {
  name: "",
  description: "",
  categoryId: "",
  supplierId: "",
  purchasePrice: "",
};

function toFormValues(tool: WorkshopToolResponse): ToolFormValues {
  return {
    name: tool.name,
    description: tool.description ?? "",
    categoryId: tool.categoryId ?? "",
    supplierId: tool.supplierId ?? "",
    purchasePrice: tool.purchasePrice ?? "",
  };
}

interface WorkshopToolFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTool: WorkshopToolResponse | null;
  page: number;
  limit: number;
}

export const WorkshopToolFormSheet = ({
  open,
  onOpenChange,
  editingTool,
  page,
  limit,
}: WorkshopToolFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingTool;
  const handleClose = () => onOpenChange(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema) as Resolver<ToolFormValues>,
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingTool ? toFormValues(editingTool) : emptyValues);
    }
  }, [open, editingTool, reset]);

  const { data: categories = [] } = useQuery({
    queryKey: workshopCategoryKeys.list(),
    queryFn: getWorkshopCategoriesAction,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: workshopSupplierKeys.list(),
    queryFn: getWorkshopSuppliersAction,
  });

  const activeSuppliers = suppliers.filter((s) => s.isActive);

  const createMutation = useMutation({
    mutationFn: createWorkshopToolAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.lists() });
      toast.success("Tool created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create tool"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToolFormValues }) =>
      updateWorkshopToolAction(id, {
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
        purchasePrice: data.purchasePrice === "" ? null : Number(data.purchasePrice),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.list({ page, limit }) });
      if (editingTool) {
        void queryClient.invalidateQueries({ queryKey: workshopToolKeys.detail(editingTool.id) });
      }
      toast.success("Tool updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update tool"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: ToolFormValues) => {
    if (isEditing && editingTool) {
      updateMutation.mutate({ id: editingTool.id, data: values });
    } else {
      createMutation.mutate({
        name: values.name,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        supplierId: values.supplierId || undefined,
        purchasePrice: values.purchasePrice === "" ? undefined : Number(values.purchasePrice),
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Tool" : "New Tool"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the tool details."
              : "Fill in the details to create a new tool."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isEditing && editingTool && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm font-medium mb-2">Image</p>
              <WorkshopToolImageUpload
                toolId={editingTool.id}
                imagePublicId={editingTool.imagePublicId ?? null}
                page={page}
                limit={limit}
              />
            </div>
          )}
          <form
            id="workshop-tool-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="tool-name">Name</FieldLabel>
                    <Input
                      id="tool-name"
                      {...field}
                      placeholder="e.g. Angle Grinder"
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
                    <FieldLabel htmlFor="tool-description">Description</FieldLabel>
                    <Textarea
                      id="tool-description"
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

              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="tool-category">Category</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="tool-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="tool-supplier">Supplier</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="tool-supplier">
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
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="purchasePrice"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="tool-purchase-price">Purchase Price</FieldLabel>
                    <Input
                      id="tool-purchase-price"
                      {...field}
                      value={field.value ?? ""}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="e.g. 150.00"
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
          <Button type="submit" form="workshop-tool-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Tool"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
