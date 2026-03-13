import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import { createLevelAction } from "@/admin/actions/create-level.action";
import { updateLevelAction } from "@/admin/actions/update-level.action";
import { levelKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { LevelResponse } from "@/interfaces/level.response";

const levelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.coerce.number().int().min(0, "Must be 0 or greater"),
  description: z.string().optional(),
});

type LevelFormValues = z.infer<typeof levelFormSchema>;

const emptyValues: LevelFormValues = {
  name: "",
  sortOrder: 0,
  description: "",
};

function toFormValues(level: LevelResponse): LevelFormValues {
  return {
    name: level.name,
    sortOrder: level.sortOrder,
    description: level.description ?? "",
  };
}

interface LevelFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLevel: LevelResponse | null;
}

export const LevelFormSheet = ({
  open,
  onOpenChange,
  editingLevel,
}: LevelFormSheetProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editingLevel;

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelFormSchema) as Resolver<LevelFormValues>,
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingLevel ? toFormValues(editingLevel) : emptyValues);
    }
  }, [open, editingLevel, reset]);

  const handleClose = () => onOpenChange(false);

  const createMutation = useMutation({
    mutationFn: createLevelAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: levelKeys.lists() });
      toast.success("Level created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create level"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LevelFormValues }) =>
      updateLevelAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: levelKeys.lists() });
      toast.success("Level updated successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update level"));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: LevelFormValues) => {
    const payload = {
      name: values.name,
      sortOrder: values.sortOrder,
      description: values.description || undefined,
    };

    if (isEditing && editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{isEditing ? "Edit Level" : "New Level"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the level details."
              : "Fill in the details to create a new level."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="level-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="level-name">Name</FieldLabel>
                    <Input
                      id="level-name"
                      {...field}
                      placeholder="e.g. Premium"
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
                name="sortOrder"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="level-sort-order">
                      Sort Order
                    </FieldLabel>
                    <Input
                      id="level-sort-order"
                      type="number"
                      min={0}
                      {...field}
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
                    <FieldLabel htmlFor="level-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="level-description"
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
          <Button type="submit" form="level-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Create Level"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
