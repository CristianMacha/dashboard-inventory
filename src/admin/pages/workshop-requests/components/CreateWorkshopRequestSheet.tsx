import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { createWorkshopRequestAction } from "@/admin/actions/create-workshop-request.action";
import { getWorkshopToolsSelectAction } from "@/admin/actions/get-workshop-tools-select.action";
import { getWorkshopMaterialsSelectAction } from "@/admin/actions/get-workshop-materials-select.action";
import {
  workshopRequestKeys,
  workshopToolSelectKeys,
  workshopMaterialSelectKeys,
} from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { WorkshopRequestType } from "@/interfaces/workshop-request.response";

const createRequestSchema = z.object({
  requestType: z.enum(["tool", "material"]),
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().positive("Must be greater than 0").optional().or(z.literal("")),
  priority: z.enum(["normal", "urgent"]).default("normal"),
  jobId: z.string().optional(),
  notes: z.string().optional(),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

const emptyValues: CreateRequestFormValues = {
  requestType: "material",
  itemId: "",
  quantity: "",
  priority: "normal",
  jobId: "",
  notes: "",
};

interface ItemComboboxProps {
  requestType: WorkshopRequestType;
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

const ItemCombobox = ({ requestType, value, onChange, error }: ItemComboboxProps) => {
  const [open, setOpen] = useState(false);

  const toolsQuery = useQuery({
    queryKey: workshopToolSelectKeys.list(),
    queryFn: () => getWorkshopToolsSelectAction(),
    enabled: requestType === "tool",
  });

  const materialsQuery = useQuery({
    queryKey: workshopMaterialSelectKeys.list(),
    queryFn: () => getWorkshopMaterialsSelectAction(),
    enabled: requestType === "material",
  });

  const items = requestType === "tool" ? (toolsQuery.data ?? []) : (materialsQuery.data ?? []);
  const isLoading = requestType === "tool" ? toolsQuery.isLoading : materialsQuery.isLoading;
  const selectedName = items.find((i) => i.id === value)?.name;

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !selectedName && "text-muted-foreground",
            )}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading…"
              : selectedName ?? `Select ${requestType === "tool" ? "tool" : "material"}…`}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-(--radix-popover-trigger-width)" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${requestType === "tool" ? "tools" : "materials"}…`}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    {item.name}
                    {value === item.id && <Check className="ml-auto size-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
};

interface CreateWorkshopRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkshopRequestSheet = ({
  open,
  onOpenChange,
}: CreateWorkshopRequestSheetProps) => {
  const queryClient = useQueryClient();
  const handleClose = () => onOpenChange(false);

  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema) as Resolver<CreateRequestFormValues>,
    defaultValues: emptyValues,
  });

  const { reset, control } = form;
  const requestType = useWatch({ control, name: "requestType" });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (values: CreateRequestFormValues) =>
      createWorkshopRequestAction({
        requestType: values.requestType,
        itemId: values.itemId,
        quantity: values.quantity === "" ? undefined : Number(values.quantity),
        priority: values.priority,
        jobId: values.jobId || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopRequestKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: workshopRequestKeys.myLists() });
      toast.success("Request created successfully");
      handleClose();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create request"));
    },
  });

  const onSubmit = (values: CreateRequestFormValues) => {
    createMutation.mutate(values);
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>New Request</SheetTitle>
          <SheetDescription>
            Submit a request for a tool or material.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <form
            id="create-workshop-request-form"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <FieldGroup>
              <Controller
                control={control}
                name="requestType"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="request-type">Type</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("itemId", "");
                      }}
                    >
                      <SelectTrigger id="request-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="itemId"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Item</FieldLabel>
                    <ItemCombobox
                      requestType={requestType}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="request-priority">Priority</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="request-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <FieldSeparator>Optional</FieldSeparator>

              <Controller
                control={control}
                name="quantity"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="request-quantity">Quantity</FieldLabel>
                    <Input
                      id="request-quantity"
                      {...field}
                      value={field.value ?? ""}
                      type="number"
                      min={0.001}
                      step="0.001"
                      placeholder="e.g. 2.5"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="jobId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="request-job-id">Job ID</FieldLabel>
                    <Input
                      id="request-job-id"
                      {...field}
                      placeholder="Link to a job (optional)"
                      autoComplete="off"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="request-notes">Notes</FieldLabel>
                    <Textarea
                      id="request-notes"
                      {...field}
                      placeholder="Any additional context…"
                      className="min-h-[80px] resize-y"
                    />
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
          <Button
            type="submit"
            form="create-workshop-request-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit Request"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
