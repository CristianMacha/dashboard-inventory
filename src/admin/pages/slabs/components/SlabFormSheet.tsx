import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Ruler } from "lucide-react";

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

import { createSlabAction } from "@/admin/actions/create-slab.action";
import { updateSlabAction } from "@/admin/actions/update-slab.action";
import { getBundlesAction } from "@/admin/actions/get-bundles.action";
import { bundleKeys, slabKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import type { SlabResponse } from "@/interfaces/slab.response";
import { SLAB_STATUSES } from "@/lib/slab-status";

const createSlabSchema = z.object({
  bundleId: z.string().min(1, "Bundle is required"),
  code: z.string().min(1, "Code is required"),
  widthCm: z.coerce.number().positive("Width must be greater than 0"),
  heightCm: z.coerce.number().positive("Height must be greater than 0"),
  description: z.string().optional(),
});

const updateSlabSchema = z.object({
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"] as const),
  description: z.string().optional(),
});

type CreateSlabFormValues = z.infer<typeof createSlabSchema>;
type UpdateSlabFormValues = z.infer<typeof updateSlabSchema>;

const defaultCreateValues: CreateSlabFormValues = {
  bundleId: "",
  code: "",
  widthCm: 0,
  heightCm: 0,
  description: "",
};

interface SlabFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSlab: SlabResponse | null;
}

export const SlabFormSheet = ({
  open,
  onOpenChange,
  editingSlab,
}: SlabFormSheetProps) => {
  const queryClient = useQueryClient();

  const { data: bundlesData, isLoading: isLoadingBundles } = useQuery({
    queryKey: bundleKeys.list({ page: 1, limit: 100 }),
    queryFn: () => getBundlesAction({ page: 1, limit: 100 }),
    enabled: open && !editingSlab,
    staleTime: 5 * 60 * 1000,
  });

  const createForm = useForm<CreateSlabFormValues>({
    resolver: zodResolver(createSlabSchema),
    defaultValues: defaultCreateValues,
  });

  const updateForm = useForm<UpdateSlabFormValues>({
    resolver: zodResolver(updateSlabSchema),
    defaultValues: { status: "AVAILABLE", description: "" },
  });

  // useForm returns stable `reset` refs — destructure to keep deps minimal
  const { reset: resetCreate } = createForm;
  const { reset: resetUpdate } = updateForm;

  useEffect(() => {
    if (open) {
      if (editingSlab) {
        resetUpdate({
          status: editingSlab.status,
          description: editingSlab.description ?? "",
        });
      } else {
        resetCreate(defaultCreateValues);
      }
    }
  }, [open, editingSlab, resetCreate, resetUpdate]);

  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: createSlabAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: slabKeys.lists() });
      toast.success("Slab created successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create slab");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlabFormValues }) =>
      updateSlabAction(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: slabKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: slabKeys.detail(id) });
      toast.success("Slab updated successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update slab");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const bundles = bundlesData?.data ?? [];

  const onCreateSubmit = (values: CreateSlabFormValues) => {
    createMutation.mutate(values);
  };

  const onUpdateSubmit = (values: UpdateSlabFormValues) => {
    if (editingSlab) {
      updateMutation.mutate({ id: editingSlab.id, data: values });
    }
  };

  const formId = editingSlab ? "slab-update-form" : "slab-create-form";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{editingSlab ? "Edit Slab" : "New Slab"}</SheetTitle>
          <SheetDescription>
            {editingSlab
              ? "Update the status or description of this slab."
              : "Select a bundle and fill in the slab details."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {editingSlab ? (
            <>
              <div className="mb-6 rounded-lg border bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-medium">{editingSlab.code}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Ruler className="size-3" />
                    Dimensions
                  </span>
                  <span className="tabular-nums font-medium">
                    {editingSlab.dimensions} cm
                  </span>
                </div>
              </div>

              <form
                id={formId}
                onSubmit={(e) =>
                  void updateForm.handleSubmit(onUpdateSubmit)(e)
                }
              >
                <FieldGroup>
                  <Controller
                    control={updateForm.control}
                    name="status"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {SLAB_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
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

                  <FieldSeparator>Optional</FieldSeparator>

                  <Controller
                    control={updateForm.control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="description">
                          Description
                        </FieldLabel>
                        <Textarea
                          id="description"
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
            </>
          ) : (
            <form
              id={formId}
              onSubmit={(e) =>
                void createForm.handleSubmit(onCreateSubmit)(e)
              }
            >
              <FieldGroup>
                <Controller
                  control={createForm.control}
                  name="bundleId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="bundleId">Bundle</FieldLabel>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        disabled={isLoadingBundles}
                      >
                        <SelectTrigger id="bundleId">
                          <SelectValue
                            placeholder={
                              isLoadingBundles
                                ? "Loading bundles…"
                                : "Select a bundle"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {bundles.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.lotNumber
                                ? `${b.lotNumber} — ${b.productName}`
                                : b.productName}
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
                  control={createForm.control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="code">Code</FieldLabel>
                      <Input
                        id="code"
                        {...field}
                        placeholder="e.g. SN-2024-001"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    control={createForm.control}
                    name="widthCm"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="widthCm">Width (cm)</FieldLabel>
                        <Input
                          id="widthCm"
                          type="number"
                          min={0}
                          step="0.1"
                          {...field}
                          placeholder="120.5"
                        />
                        {fieldState.invalid && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={createForm.control}
                    name="heightCm"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="heightCm">Height (cm)</FieldLabel>
                        <Input
                          id="heightCm"
                          type="number"
                          min={0}
                          step="0.1"
                          {...field}
                          placeholder="240.0"
                        />
                        {fieldState.invalid && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>

                <FieldSeparator>Optional</FieldSeparator>

                <Controller
                  control={createForm.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="slabDescription">
                        Description
                      </FieldLabel>
                      <Textarea
                        id="slabDescription"
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
          )}
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
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : editingSlab
                ? "Save Changes"
                : "Create Slab"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
