import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Ruler, Scissors } from "lucide-react";

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

import { updateSlabAction } from "@/admin/actions/update-slab.action";
import { createRemnantSlabAction } from "@/admin/actions/create-remnant-slab.action";
import { slabKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { SlabResponse } from "@/interfaces/slab.response";

// ─── Schemas ────────────────────────────────────────────────────────────────

const updateSlabSchema = z.object({
  description: z.string().optional(),
});

const remnantSlabSchema = z.object({
  code: z.string().min(1, "Code is required"),
  widthCm: z.coerce.number().positive("Width must be greater than 0"),
  heightCm: z.coerce.number().positive("Height must be greater than 0"),
  description: z.string().optional(),
});

type UpdateSlabFormValues = z.infer<typeof updateSlabSchema>;
type RemnantSlabFormValues = z.infer<typeof remnantSlabSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface SlabFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSlab: SlabResponse | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const SlabFormSheet = ({
  open,
  onOpenChange,
  editingSlab,
}: SlabFormSheetProps) => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"view" | "remnant">("view");

  const updateForm = useForm<UpdateSlabFormValues>({
    resolver: zodResolver(updateSlabSchema),
    defaultValues: { description: editingSlab?.description ?? "" },
  });

  const remnantForm = useForm<RemnantSlabFormValues>({
    resolver: zodResolver(remnantSlabSchema) as Resolver<RemnantSlabFormValues>,
    defaultValues: { code: "", widthCm: 0, heightCm: 0, description: "" },
  });

  const { reset: resetUpdate } = updateForm;
  const { reset: resetRemnant } = remnantForm;

  // Reset state and forms whenever the sheet opens or the editing slab changes
  useEffect(() => {
    if (open) {
      setMode("view");
      resetUpdate({ description: editingSlab?.description ?? "" });
      resetRemnant({ code: "", widthCm: 0, heightCm: 0, description: "" });
    }
  }, [open, editingSlab, resetUpdate, resetRemnant]);

  const handleClose = () => onOpenChange(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlabFormValues }) =>
      updateSlabAction(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: slabKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: slabKeys.detail(id) });
      toast.success("Slab updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update slab"));
    },
  });

  const remnantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RemnantSlabFormValues }) =>
      createRemnantSlabAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: slabKeys.lists() });
      toast.success("Remnant slab created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create remnant"));
    },
  });

  const isSubmitting = updateMutation.isPending || remnantMutation.isPending;

  const onUpdateSubmit = (values: UpdateSlabFormValues) => {
    if (editingSlab) updateMutation.mutate({ id: editingSlab.id, data: values });
  };

  const onRemnantSubmit = (values: RemnantSlabFormValues) => {
    if (editingSlab) remnantMutation.mutate({ id: editingSlab.id, data: values });
  };

  const formId = mode === "remnant" ? "slab-remnant-form" : "slab-update-form";
  const isEditingSoldNonRemnant = editingSlab?.status === "SOLD" && !editingSlab?.isRemnant;

  if (!editingSlab) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>
            {mode === "remnant" ? "Create Remnant" : "Edit Slab"}
          </SheetTitle>
          <SheetDescription>
            {mode === "remnant"
              ? `Creating a remnant from slab ${editingSlab.code}.`
              : "Update the description of this slab."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Slab info summary */}
          <div className="mb-4 rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Code</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{editingSlab.code}</span>
                {editingSlab.isRemnant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-800">
                    <Scissors className="size-3" />
                    Remnant
                  </span>
                )}
              </div>
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

          {/* Update description form */}
          <form
            id="slab-update-form"
            className={mode === "remnant" ? "hidden" : undefined}
            onSubmit={(e) => void updateForm.handleSubmit(onUpdateSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={updateForm.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
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

          {/* Remnant creation form */}
          <form
            id="slab-remnant-form"
            className={mode !== "remnant" ? "hidden" : undefined}
            onSubmit={(e) => void remnantForm.handleSubmit(onRemnantSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={remnantForm.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="remnantCode">Code</FieldLabel>
                    <Input
                      id="remnantCode"
                      {...field}
                      placeholder="e.g. REM-001"
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
                  control={remnantForm.control}
                  name="widthCm"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="remnantWidth">Width (cm)</FieldLabel>
                      <Input
                        id="remnantWidth"
                        type="number"
                        min={0}
                        step="0.1"
                        {...field}
                        placeholder="45.0"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={remnantForm.control}
                  name="heightCm"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="remnantHeight">Height (cm)</FieldLabel>
                      <Input
                        id="remnantHeight"
                        type="number"
                        min={0}
                        step="0.1"
                        {...field}
                        placeholder="30.0"
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
                control={remnantForm.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="remnantDescription">Description</FieldLabel>
                    <Textarea
                      id="remnantDescription"
                      {...field}
                      placeholder="e.g. Left piece in good condition"
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

          {/* Remnant shortcut — only for SOLD non-remnant slabs, in view mode */}
          {isEditingSoldNonRemnant && mode === "view" && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-950/20">
              <p className="text-xs text-orange-700 dark:text-orange-400 mb-2">
                This slab is sold. You can register a leftover remnant from it.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-400"
                onClick={() => {
                  resetRemnant({ code: "", widthCm: 0, heightCm: 0, description: "" });
                  setMode("remnant");
                }}
              >
                <Scissors className="size-3.5" />
                Create Remnant
              </Button>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t">
          {mode === "remnant" ? (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setMode("view")}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button type="submit" form={formId} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? "Creating…" : "Create Remnant"}
              </Button>
            </>
          ) : (
            <>
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
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
