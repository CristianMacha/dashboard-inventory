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
  Pencil,
  PhoneIcon,
  Plus,
  ShoppingCart,
  Trash2,
  UserIcon,
  X,
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
import { JobPaymentPanel } from "./components/JobPaymentPanel";
import { createJobAction } from "@/admin/actions/create-job.action";
import { addBulkJobItemsAction, type BulkJobItemDto } from "@/admin/actions/add-bulk-job-items.action";
import { removeJobItemAction } from "@/admin/actions/remove-job-item.action";
import { approveJobAction } from "@/admin/actions/approve-job.action";
import { startJobAction } from "@/admin/actions/start-job.action";
import { completeJobAction } from "@/admin/actions/complete-job.action";
import { cancelJobAction } from "@/admin/actions/cancel-job.action";
import { updateJobAction, type JobUpdate } from "@/admin/actions/update-job.action";
import { getProductsForSelectAction } from "@/admin/actions/get-products-for-select.action";
import { getBundlesAction } from "@/admin/actions/get-bundles.action";
import { getBundleByIdAction } from "@/admin/actions/get-bundle-by-id.action";
import { jobKeys, bundleKeys, productSelectKeys, slabKeys } from "@/admin/queryKeys";
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

// ─── Cart item type ───────────────────────────────────────────────────────────

interface CartItem {
  slabId: string;
  slabCode: string;
  dimensions: string;
  productName: string;
  bundleLotNumber?: string;
  unitPrice: number;
  description: string;
}

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

function JobDetail({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const { data: job } = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJobByIdAction(jobId),
  });

  if (!job) return null;

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
          <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
            <Pencil className="size-4" />
            Edit
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
            <InfoItem label="Paid" value={currency.format(job.paidAmount)} />
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
                    <TableHead className="font-semibold">Slab</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Unit Price</TableHead>
                    {canAddItems && <TableHead className="w-[50px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {item.slabCode}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.description ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium">
                        {currency.format(item.unitPrice)}
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

      {job.status !== "QUOTED" && job.status !== "CANCELLED" && (
        <JobPaymentPanel jobId={job.id} jobStatus={job.status} />
      )}

      <AddSlabSheet
        jobId={job.id}
        open={itemSheetOpen}
        onOpenChange={setItemSheetOpen}
      />

      <EditJobSheet
        job={job}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </div>
  );
}

// ─── Edit Job Sheet ───────────────────────────────────────────────────────────

const editSchema = z.object({
  projectName: z.string().min(1, "Required"),
  clientName: z.string().min(1, "Required"),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientAddress: z.string().optional(),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  taxAmount: z.coerce.number().min(0, "Must be >= 0"),
});

type EditFormValues = z.infer<typeof editSchema>;

function EditJobSheet({
  job,
  open,
  onOpenChange,
}: {
  job: JobDetailResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<EditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      projectName: job.projectName,
      clientName: job.clientName,
      clientPhone: job.clientPhone ?? "",
      clientEmail: job.clientEmail ?? "",
      clientAddress: job.clientAddress ?? "",
      notes: job.notes ?? "",
      scheduledDate: job.scheduledDate ?? "",
      taxAmount: job.taxAmount,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        projectName: job.projectName,
        clientName: job.clientName,
        clientPhone: job.clientPhone ?? "",
        clientEmail: job.clientEmail ?? "",
        clientAddress: job.clientAddress ?? "",
        notes: job.notes ?? "",
        scheduledDate: job.scheduledDate ?? "",
        taxAmount: job.taxAmount,
      });
    }
  }, [open, job, reset]);

  const mutation = useMutation({
    mutationFn: (values: EditFormValues) => {
      const payload: JobUpdate = {
        projectName: values.projectName,
        clientName: values.clientName,
        clientPhone: values.clientPhone || undefined,
        clientEmail: values.clientEmail || undefined,
        clientAddress: values.clientAddress || undefined,
        notes: values.notes || undefined,
        scheduledDate: values.scheduledDate || undefined,
        taxAmount: values.taxAmount,
      };
      return updateJobAction(job.id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) });
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success("Job updated");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update job");
    },
  });

  const onSubmit = (values: EditFormValues) => mutation.mutate(values as EditFormValues);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b">
          <SheetTitle>Edit Job</SheetTitle>
          <SheetDescription>Update project and client information</SheetDescription>
        </SheetHeader>

        <form
          id="edit-job-form"
          className="flex-1 overflow-y-auto p-4"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="projectName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="edit-projectName">Project Name</FieldLabel>
                  <Input id="edit-projectName" {...field} />
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="clientName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-clientName">Client Name</FieldLabel>
                    <Input id="edit-clientName" {...field} />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="clientPhone"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-clientPhone">Phone</FieldLabel>
                    <Input id="edit-clientPhone" type="tel" {...field} placeholder="optional" />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="clientEmail"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-clientEmail">Email</FieldLabel>
                    <Input id="edit-clientEmail" type="email" {...field} placeholder="optional" />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="taxAmount"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-taxAmount">Tax Amount</FieldLabel>
                    <Input
                      id="edit-taxAmount"
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="clientAddress"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="edit-clientAddress">Address</FieldLabel>
                  <Input id="edit-clientAddress" {...field} placeholder="optional" />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="scheduledDate"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="edit-scheduledDate">Scheduled Date</FieldLabel>
                  <Input id="edit-scheduledDate" type="date" {...field} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="edit-notes">
                    Notes <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea id="edit-notes" {...field} rows={3} />
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
          <Button type="submit" form="edit-job-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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

  // Browser step state
  const [productId, setProductId] = useState("");
  const [bundleId, setBundleId] = useState("");

  // Per-slab fields (unit price / description before adding to cart)
  const [unitPrice, setUnitPrice] = useState(0);
  const [description, setDescription] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  // Which slab IDs are checked in the current bundle view
  const [checkedSlabIds, setCheckedSlabIds] = useState<Set<string>>(new Set());

  // Reset everything when sheet opens/closes
  useEffect(() => {
    if (open) {
      setProductId("");
      setBundleId("");
      setUnitPrice(0);
      setDescription("");
      setCart([]);
      setCheckedSlabIds(new Set());
    }
  }, [open]);

  // Step 1 — products for select
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: productSelectKeys.all,
    queryFn: getProductsForSelectAction,
    enabled: open,
  });

  // Step 2 — bundles filtered by product
  const { data: bundlesData, isLoading: isLoadingBundles } = useQuery({
    queryKey: bundleKeys.list({ page: 1, limit: 100, productId }),
    queryFn: () => getBundlesAction({ page: 1, limit: 100, productId }),
    enabled: !!productId,
  });

  // Step 3 — bundle detail (includes slabs)
  const { data: bundleDetail, isLoading: isLoadingSlabs } = useQuery({
    queryKey: bundleKeys.detail(bundleId),
    queryFn: () => getBundleByIdAction(bundleId),
    enabled: !!bundleId,
  });

  const bundles = bundlesData?.data ?? [];
  const selectedBundle = bundles.find((b) => b.id === bundleId);
  const cartSlabIds = new Set(cart.map((c) => c.slabId));

  // Available slabs in the current bundle, excluding ones already in cart
  const availableSlabs = (bundleDetail?.slabs ?? []).filter(
    (s) => s.status === "AVAILABLE" && !cartSlabIds.has(s.id),
  );

  // Toggle a slab in the checked set
  const toggleSlab = (slabId: string) => {
    setCheckedSlabIds((prev) => {
      const next = new Set(prev);
      if (next.has(slabId)) next.delete(slabId);
      else next.add(slabId);
      return next;
    });
  };

  // Add all checked slabs to cart with current unitPrice / description
  const addCheckedToCart = () => {
    if (!bundleDetail || !selectedBundle || checkedSlabIds.size === 0) return;
    const newItems: CartItem[] = [];
    for (const slab of bundleDetail.slabs) {
      if (!checkedSlabIds.has(slab.id)) continue;
      newItems.push({
        slabId: slab.id,
        slabCode: slab.code,
        dimensions: slab.dimensions,
        productName: selectedBundle.productName,
        bundleLotNumber: selectedBundle.lotNumber,
        unitPrice,
        description,
      });
    }
    setCart((prev) => [...prev, ...newItems]);
    setCheckedSlabIds(new Set());
    setUnitPrice(0);
    setDescription("");
  };

  const removeFromCart = (slabId: string) => {
    setCart((prev) => prev.filter((c) => c.slabId !== slabId));
  };

  const updateCartItem = (slabId: string, patch: Partial<Pick<CartItem, "unitPrice" | "description">>) => {
    setCart((prev) =>
      prev.map((c) => (c.slabId === slabId ? { ...c, ...patch } : c)),
    );
  };

  const mutation = useMutation({
    mutationFn: () => {
      const items: BulkJobItemDto[] = cart.map((c) => ({
        slabId: c.slabId,
        unitPrice: c.unitPrice,
        description: c.description || undefined,
      }));
      return addBulkJobItemsAction(jobId, items);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success(`${cart.length} slab${cart.length !== 1 ? "s" : ""} added to job`);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to add slabs");
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            Add Slabs to Job
            {cart.length > 0 && (
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                {cart.length}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Browse by product and bundle, check slabs, then add them to the cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── Browser section ── */}
          <div className="p-4 space-y-3 border-b">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Browse
            </p>

            {/* Step 1 — Product */}
            <Field>
              <FieldLabel htmlFor="productId">Product</FieldLabel>
              <Select
                value={productId}
                onValueChange={(v) => {
                  setProductId(v);
                  setBundleId("");
                  setCheckedSlabIds(new Set());
                }}
                disabled={isLoadingProducts}
              >
                <SelectTrigger id="productId">
                  <SelectValue
                    placeholder={isLoadingProducts ? "Loading…" : "Select a product"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Step 2 — Bundle */}
            <Field>
              <FieldLabel htmlFor="bundleId">Bundle</FieldLabel>
              <Select
                value={bundleId}
                onValueChange={(v) => {
                  setBundleId(v);
                  setCheckedSlabIds(new Set());
                }}
                disabled={!productId || isLoadingBundles}
              >
                <SelectTrigger id="bundleId">
                  <SelectValue
                    placeholder={
                      !productId
                        ? "Select a product first"
                        : isLoadingBundles
                          ? "Loading…"
                          : bundles.length === 0
                            ? "No bundles for this product"
                            : "Select a bundle"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {bundles.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.lotNumber ? `Lot ${b.lotNumber}` : b.id.slice(0, 8)}
                      {" · "}
                      {b.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Step 3 — Slab checkboxes */}
            {bundleId && (
              <div className="space-y-2">
                <FieldLabel>Available Slabs</FieldLabel>
                {isLoadingSlabs ? (
                  <p className="text-sm text-muted-foreground py-2">Loading slabs…</p>
                ) : availableSlabs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No available slabs in this bundle
                  </p>
                ) : (
                  <div className="rounded-md border divide-y">
                    {availableSlabs.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary cursor-pointer"
                          checked={checkedSlabIds.has(s.id)}
                          onChange={() => toggleSlab(s.id)}
                        />
                        <span className="flex-1 text-sm">
                          <span className="font-medium font-mono">{s.code}</span>
                          <span className="text-muted-foreground"> · {s.dimensions}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Unit price + description for checked slabs, shown when at least one checked */}
            {checkedSlabIds.size > 0 && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Applied to {checkedSlabIds.size} selected slab{checkedSlabIds.size !== 1 ? "s" : ""}
                </p>
                <Field>
                  <FieldLabel htmlFor="unitPrice">Unit Price</FieldLabel>
                  <Input
                    id="unitPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.valueAsNumber || 0)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="slab-desc">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="slab-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Kitchen island counter"
                  />
                </Field>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={addCheckedToCart}
                >
                  <ShoppingCart className="size-4" />
                  Add {checkedSlabIds.size} slab{checkedSlabIds.size !== 1 ? "s" : ""} to cart
                </Button>
              </div>
            )}
          </div>

          {/* ── Cart section ── */}
          {cart.length > 0 && (
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cart ({cart.length})
              </p>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.slabId}
                    className="rounded-md border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm space-y-0.5">
                        <p className="font-medium font-mono leading-none">{item.slabCode}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.productName}
                          {item.bundleLotNumber ? ` · Lot ${item.bundleLotNumber}` : ""}
                          {" · "}{item.dimensions}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeFromCart(item.slabId)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                          Price
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          className="h-7 text-sm mt-0.5"
                          onChange={(e) =>
                            updateCartItem(item.slabId, {
                              unitPrice: e.target.valueAsNumber || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                          Description
                        </label>
                        <Input
                          value={item.description}
                          className="h-7 text-sm mt-0.5"
                          placeholder="optional"
                          onChange={(e) =>
                            updateCartItem(item.slabId, { description: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end border-t pt-4 gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={cart.length === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending
              ? "Adding…"
              : `Add ${cart.length} slab${cart.length !== 1 ? "s" : ""}`}
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

  return <JobDetail jobId={job.id} />;
};
