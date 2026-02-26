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

import { createFinishAction } from "@/admin/actions/create-finish.action";
import { updateFinishAction } from "@/admin/actions/update-finish.action";
import { finishKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import type { FinishResponse } from "@/interfaces/finish.response";

const finishFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().optional(),
  description: z.string().optional(),
});

type FinishFormValues = z.infer<typeof finishFormSchema>;

const emptyValues: FinishFormValues = {
  name: "",
  abbreviation: "",
  description: "",
};

function toFormValues(finish: FinishResponse): FinishFormValues {
  return {
    name: finish.name,
    abbreviation: finish.abbreviation ?? "",
    description: finish.description ?? "",
  };
}

interface FinishFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFinish: FinishResponse | null;
}

export const FinishFormSheet = ({
  open,
  onOpenChange,
  editingFinish,
}: FinishFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingFinish;

  const form = useForm<FinishFormValues>({
    resolver: zodResolver(finishFormSchema),
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingFinish ? toFormValues(editingFinish) : emptyValues);
    }
  }, [open, editingFinish, reset]);

  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: createFinishAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: finishKeys.lists() });
      toast.success("Finish created successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create finish");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinishFormValues }) =>
      updateFinishAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: finishKeys.lists() });
      toast.success("Finish updated successfully");
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update finish");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FinishFormValues) => {
    const payload = {
      name: values.name,
      abbreviation: values.abbreviation || undefined,
      description: values.description || undefined,
    };

    if (isEditing && editingFinish) {
      updateMutation.mutate({ id: editingFinish.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Finish" : "New Finish"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the finish details."
              : "Fill in the details to create a new finish."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="finish-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="finish-name">Name</FieldLabel>
                    <Input
                      id="finish-name"
                      {...field}
                      placeholder="e.g. Pulido"
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
                    <FieldLabel htmlFor="finish-abbreviation">
                      Abbreviation
                    </FieldLabel>
                    <Input
                      id="finish-abbreviation"
                      {...field}
                      placeholder="e.g. PL"
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
                    <FieldLabel htmlFor="finish-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="finish-description"
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
          <Button type="submit" form="finish-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Finish"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
