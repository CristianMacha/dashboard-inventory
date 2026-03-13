import { useEffect } from "react";
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/apiClient";

interface UseFormSheetOptions<TValues extends FieldValues, TResponse> {
  open: boolean;
  editingItem: TResponse | null;
  schema: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  emptyValues: DefaultValues<TValues>;
  toFormValues: (item: TResponse) => TValues;
  createFn: (values: TValues) => Promise<TResponse>;
  updateFn: (id: string, values: TValues) => Promise<TResponse>;
  getId: (item: TResponse) => string;
  createInvalidateKey: readonly unknown[];
  updateInvalidateKey: readonly unknown[];
  entityName: string;
  onClose: () => void;
}

interface UseFormSheetResult<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  isSubmitting: boolean;
  onSubmit: (values: TValues) => void;
}

export function useFormSheet<TValues extends FieldValues, TResponse>({
  open,
  editingItem,
  schema,
  emptyValues,
  toFormValues,
  createFn,
  updateFn,
  getId,
  createInvalidateKey,
  updateInvalidateKey,
  entityName,
  onClose,
}: UseFormSheetOptions<TValues, TResponse>): UseFormSheetResult<TValues> {
  const queryClient = useQueryClient();

  const form = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(editingItem ? (toFormValues(editingItem) as DefaultValues<TValues>) : emptyValues);
    }
  }, [open, editingItem, reset, emptyValues, toFormValues]);

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: createInvalidateKey });
      toast.success(`${entityName} created successfully`);
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, `Failed to create ${entityName.toLowerCase()}`));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TValues }) =>
      updateFn(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: updateInvalidateKey });
      toast.success(`${entityName} updated successfully`);
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, `Failed to update ${entityName.toLowerCase()}`));
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: TValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: getId(editingItem), values });
    } else {
      createMutation.mutate(values);
    }
  };

  return { form, isSubmitting, onSubmit };
}
