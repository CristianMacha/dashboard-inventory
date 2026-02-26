import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  Loader2,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  Plus,
  Trash2,
  UserIcon,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { getJobByIdAction } from "@/admin/actions/get-job-by-id.action";
import { createJobAction } from "@/admin/actions/create-job.action";
import { addJobItemAction } from "@/admin/actions/add-job-item.action";
import { removeJobItemAction } from "@/admin/actions/remove-job-item.action";
import { approveJobAction } from "@/admin/actions/approve-job.action";
import { startJobAction } from "@/admin/actions/start-job.action";
import { completeJobAction } from "@/admin/actions/complete-job.action";
import { cancelJobAction } from "@/admin/actions/cancel-job.action";
import { getSlabsAction } from "@/admin/actions/get-slabs.action";
import { jobKeys, slabKeys } from "@/admin/queryKeys";
import { ApiError } from "@/api/apiClient";
import { JOB_STATUS_CONFIG } from "@/lib/job-status";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import type { JobDetailResponse, JobStatus } from "@/interfaces/job.response";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ─── Create form schema ──────────────────────────────────────────────────────

const createSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientAddress: z.string().optional(),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

// ─── Add-item sheet schema ───────────────────────────────────────────────────

const addItemSchema = z.object({
  slabId: z.string().min(1, "Slab is required"),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Must be >= 0"),
});

type AddItemFormValues = z.infer<typeof addItemSchema>;

// ─── Status action helpers ───────────────────────────────────────────────────

function getAvailableActions(status: JobStatus) {
  const actions: {
    label: string;
    variant: "default" | "destructive" | "outline";
    action: "approve" | "start" | "complete" | "cancel";
  }[] = [];

  if (status === "QUOTED") {
    actions.push({ label: "Approve", variant: "default", action: "approve" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }
  if (status === "APPROVED") {
    actions.push({ label: "Start", variant: "default", action: "start" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }
  if (status === "IN_PROGRESS") {
    actions.push({ label: "Complete", variant: "default", action: "complete" });
    actions.push({ label: "Cancel", variant: "destructive", action: "cancel" });
  }

  return actions;
}

// ─── Create Mode ─────────────────────────────────────────────────────────────

function CreateJobForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      clientAddress: "",
      notes: "",
      scheduledDate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createJobAction,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success("Job created successfully");
      void navigate(`/jobs/${result.id}`);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create job");
    },
  });

  const onSubmit = (values: CreateFormValues) => {
    mutation.mutate({
      projectName: values.projectName,
      clientName: values.clientName,
      clientPhone: values.clientPhone || undefined,
      clientEmail: values.clientEmail || undefined,
      clientAddress: values.clientAddress || undefined,
      notes: values.notes || undefined,
      scheduledDate: values.scheduledDate || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/jobs">Jobs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Job</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BriefcaseIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">New Job</h1>
          <p className="text-sm text-muted-foreground">
            Create a new project for a client
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <FieldGroup>
              <Controller
                control={control}
                name="projectName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
                    <Input
                      id="projectName"
                      {...field}
                      placeholder="e.g. Kitchen Renovation - Smith Residence"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="clientName"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="clientName">Client Name</FieldLabel>
                      <Input
                        id="clientName"
                        {...field}
                        placeholder="e.g. John Smith"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="clientPhone"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="clientPhone">
                        Phone <span className="font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <Input
                        id="clientPhone"
                        type="tel"
                        {...field}
                        placeholder="+1-555-0100"
                      />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="clientEmail"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="clientEmail">
                        Email <span className="font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <Input
                        id="clientEmail"
                        type="email"
                        {...field}
                        placeholder="john@example.com"
                      />
                      {fieldState.invalid && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="scheduledDate">
                        Scheduled Date{" "}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </FieldLabel>
                      <Input id="scheduledDate" type="date" {...field} />
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="clientAddress"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="clientAddress">
                      Address <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      id="clientAddress"
                      {...field}
                      placeholder="123 Main St, City"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="notes">
                      Notes <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Textarea
                      id="notes"
                      {...field}
                      placeholder="Additional notes about this job…"
                      rows={3}
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" asChild>
                <Link to="/jobs">Cancel</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {mutation.isPending ? "Creating…" : "Create Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Detail Mode ─────────────────────────────────────────────────────────────

function JobDetail({ job }: { job: JobDetailResponse }) {
  const queryClient = useQueryClient();
  const [itemSheetOpen, setItemSheetOpen] = useState(false);

  const statusConfig = JOB_STATUS_CONFIG[job.status];
  const actions = getAvailableActions(job.status);
  const canAddItems = job.status === "QUOTED";

  const statusMutation = useMutation({
    mutationFn: async (action: "approve" | "start" | "complete" | "cancel") => {
      if (action === "approve") return approveJobAction(job.id);
      if (action === "start") return startJobAction(job.id);
      if (action === "complete") return completeJobAction(job.id);
      return cancelJobAction(job.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) });
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: slabKeys.all });
      toast.success("Job status updated");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update status");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeJobItemAction(job.id, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) });
      toast.success("Item removed");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to remove item");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/jobs">Jobs</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {job.projectName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseIcon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">
                {job.projectName}
              </h1>
              <StatusBadge label={statusConfig.label} className={statusConfig.className} />
            </div>
            {job.notes && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {job.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" asChild>
            <Link to="/jobs">
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
          {actions.map((a) => {
            const isThisActionPending =
              statusMutation.isPending && statusMutation.variables === a.action;
            return (
              <Button
                key={a.action}
                variant={a.variant}
                onClick={() => statusMutation.mutate(a.action)}
                disabled={statusMutation.isPending}
              >
                {isThisActionPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {a.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Client & info strip */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            <InfoItem
              label="Client"
              value={job.clientName}
              icon={<UserIcon className="size-3 shrink-0" />}
            />
            {job.clientPhone && (
              <InfoItem
                label="Phone"
                value={job.clientPhone}
                icon={<PhoneIcon className="size-3 shrink-0" />}
              />
            )}
            {job.clientEmail && (
              <InfoItem
                label="Email"
                value={job.clientEmail}
                icon={<MailIcon className="size-3 shrink-0" />}
              />
            )}
            {job.clientAddress && (
              <InfoItem
                label="Address"
                value={job.clientAddress}
                icon={<MapPinIcon className="size-3 shrink-0" />}
              />
            )}
            <InfoItem
              label="Scheduled"
              value={job.scheduledDate ? formatDate(job.scheduledDate) : undefined}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            {job.completedDate && (
              <InfoItem
                label="Completed"
                value={formatDate(job.completedDate)}
                icon={<CalendarIcon className="size-3 shrink-0" />}
              />
            )}
            <InfoItem label="Subtotal" value={currency.format(job.subtotal)} />
            <InfoItem label="Tax" value={currency.format(job.taxAmount)} />
            <InfoItem label="Total" value={currency.format(job.totalAmount)} />
            <InfoItem label="Slabs" value={String(job.itemCount)} />
          </dl>
        </CardContent>
      </Card>

      <Separator />

      {/* Items section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Job Items (Slabs)</h2>
          <p className="text-sm text-muted-foreground">
            {job.items.length === 0
              ? "No slabs assigned to this job yet"
              : `${job.items.length} slab${job.items.length !== 1 ? "s" : ""} assigned`}
          </p>
        </div>
        {canAddItems && (
          <Button onClick={() => setItemSheetOpen(true)}>
            <Plus className="size-4" />
            Add Slab
          </Button>
        )}
      </div>

      {job.items.length > 0 && (
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Unit Price</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    {canAddItems && <TableHead className="w-[50px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {item.description ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {currency.format(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-sm">
                        {currency.format(item.totalPrice)}
                      </TableCell>
                      {canAddItems && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMutation.mutate(item.id)}
                            disabled={removeMutation.isPending}
                            aria-label="Remove slab"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddSlabSheet
        jobId={job.id}
        open={itemSheetOpen}
        onOpenChange={setItemSheetOpen}
      />
    </div>
  );
}

// ─── Add Slab Sheet ──────────────────────────────────────────────────────────

function AddSlabSheet({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: slabsData } = useQuery({
    queryKey: slabKeys.list({ page: 1, limit: 100 }),
    queryFn: () => getSlabsAction({ page: 1, limit: 100 }),
    enabled: open,
  });

  const { control, handleSubmit, reset } = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      slabId: "",
      description: "",
      unitPrice: 0,
    },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: AddItemFormValues) =>
      addJobItemAction(jobId, {
        slabId: values.slabId,
        description: values.description || undefined,
        unitPrice: values.unitPrice,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success("Slab added to job");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to add slab");
    },
  });

  const onSubmit = (values: AddItemFormValues) => mutation.mutate(values);
  const availableSlabs = (slabsData?.data ?? []).filter(
    (s) => s.status === "AVAILABLE",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle>Add Slab to Job</SheetTitle>
          <SheetDescription>
            Select an available slab and set its price for this project
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-slab-form"
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="slabId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="slabId">Slab</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="slabId">
                      <SelectValue placeholder="Select an available slab" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlabs.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} — {s.dimensions}
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
              control={control}
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="slab-desc">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="slab-desc"
                    {...field}
                    placeholder="e.g. Granito Blanco Polar - Slab SLB-001"
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="unitPrice"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="unitPrice">Unit Price</FieldLabel>
                  <Input
                    id="unitPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-slab-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Adding…" : "Add Slab"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <dt className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </dt>
      <dd className="text-sm font-semibold flex items-center gap-1">
        {icon}
        {value ?? <span className="text-muted-foreground font-normal">—</span>}
      </dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    queryFn: () => getJobByIdAction(id!),
    enabled: !isNew && !!id,
  });

  const handleNotFound = useCallback(() => {
    void navigate("/jobs", { replace: true });
  }, [navigate]);

  if (isNew) return <CreateJobForm />;
  if (isLoading) return <DetailSkeleton />;
  if (isError || !job) {
    handleNotFound();
    return null;
  }

  return <JobDetail job={job} />;
};
