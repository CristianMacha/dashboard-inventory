import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

import { createWorkshopMaterialAction } from "@/admin/actions/create-workshop-material.action";
import { updateWorkshopMaterialAction } from "@/admin/actions/update-workshop-material.action";
import { getWorkshopCategoriesAction } from "@/admin/actions/get-workshop-categories.action";
import { getWorkshopSuppliersAction } from "@/admin/actions/get-workshop-suppliers.action";
import { workshopMaterialKeys, workshopCategoryKeys, workshopSupplierKeys } from "@/admin/queryKeys";
import { WorkshopMaterialImageUpload } from "@/admin/components/WorkshopMaterialImageUpload";
import { ApiError } from "@/api/apiClient";
import type { WorkshopMaterialResponse } from "@/interfaces/workshop-material.response";

const materialFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  description: z.string().optional(),
  minStock: z.coerce.number().min(0).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

const emptyValues: MaterialFormValues = {
  name: "",
  unit: "",
  description: "",
  minStock: "",
  unitPrice: "",
  categoryId: "",
  supplierId: "",
};

function toFormValues(material: WorkshopMaterialResponse): MaterialFormValues {
  return {
    name: material.name,
    unit: material.unit,
    description: material.description ?? "",
    minStock: material.minStock,
    unitPrice: material.unitPrice ?? "",
    categoryId: material.categoryId ?? "",
    supplierId: material.supplierId ?? "",
  };
}

interface WorkshopMaterialFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: WorkshopMaterialResponse | null;
  page: number;
  limit: number;
}

export const WorkshopMaterialFormSheet = ({
  open,
  onOpenChange,
  editingMaterial,
  page,
  limit,
}: WorkshopMaterialFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingMaterial;
  const handleClose = () => onOpenChange(false);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingMaterial ? toFormValues(editingMaterial) : emptyValues);
    }
  }, [open, editingMaterial, reset]);

  const { data: categories = [] } = useQuery({
    queryKey: workshopCategoryKeys.list(),
    queryFn: getWorkshopCategoriesAction,
    staleTime: 5 * 60 * 1000,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: workshopSupplierKeys.list(),
    queryFn: getWorkshopSuppliersAction,
    staleTime: 5 * 60 * 1000,
  });

  const activeSuppliers = suppliers.filter((s) => s.isActive);

  const createMutation = useMutation({
    mutationFn: createWorkshopMaterialAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.lists() });
      toast.success("Material created successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create material");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaterialFormValues }) =>
      updateWorkshopMaterialAction(id, {
        name: data.name,
        unit: data.unit,
        description: data.description || null,
        minStock: data.minStock === "" ? undefined : Number(data.minStock),
        unitPrice: data.unitPrice === "" ? null : Number(data.unitPrice),
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.list({ page, limit }) });
      if (editingMaterial) {
        void queryClient.invalidateQueries({ queryKey: workshopMaterialKeys.detail(editingMaterial.id) });
      }
      toast.success("Material updated successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update material");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: MaterialFormValues) => {
    if (isEditing && editingMaterial) {
      updateMutation.mutate({ id: editingMaterial.id, data: values });
    } else {
      createMutation.mutate({
        name: values.name,
        unit: values.unit,
        description: values.description || undefined,
        minStock: values.minStock === "" ? undefined : Number(values.minStock),
        unitPrice: values.unitPrice === "" ? undefined : Number(values.unitPrice),
        categoryId: values.categoryId || undefined,
        supplierId: values.supplierId || undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Material" : "New Material"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the material details."
              : "Fill in the details to create a new material."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isEditing && editingMaterial && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm font-medium mb-2">Image</p>
              <WorkshopMaterialImageUpload
                materialId={editingMaterial.id}
                imagePublicId={editingMaterial.imagePublicId ?? null}
                page={page}
                limit={limit}
              />
            </div>
          )}
          <form
            id="workshop-material-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="material-name">Name</FieldLabel>
                    <Input
                      id="material-name"
                      {...field}
                      placeholder="e.g. Epoxy Resin"
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
                name="unit"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="material-unit">Unit</FieldLabel>
                    <Input
                      id="material-unit"
                      {...field}
                      placeholder="e.g. kg, L, pcs"
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
                name="minStock"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="material-min-stock">Min. Stock</FieldLabel>
                    <Input
                      id="material-min-stock"
                      {...field}
                      value={field.value ?? ""}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0"
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
                    <FieldLabel htmlFor="material-description">Description</FieldLabel>
                    <Textarea
                      id="material-description"
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
                name="unitPrice"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="material-unit-price">Unit Price</FieldLabel>
                    <Input
                      id="material-unit-price"
                      {...field}
                      value={field.value ?? ""}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="e.g. 25.00"
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
                    <FieldLabel htmlFor="material-category">Category</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="material-category">
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
                    <FieldLabel htmlFor="material-supplier">Supplier</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="material-supplier">
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
          <Button type="submit" form="workshop-material-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Material"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
