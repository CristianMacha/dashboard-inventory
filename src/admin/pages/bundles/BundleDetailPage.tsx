import { useCallback, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Layers2Icon,
  Loader2,
  PackageIcon,
  ReceiptIcon,
  Undo2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { getBundleByIdAction } from "@/admin/actions/get-bundle-by-id.action";
import { BundleImageUpload } from "@/admin/components/BundleImageUpload";
import { getSupplierReturnsForSelectAction } from "@/admin/actions/get-supplier-returns-for-select.action";
import { createSupplierReturnAction } from "@/admin/actions/create-supplier-return.action";
import { addReturnItemAction } from "@/admin/actions/add-return-item.action";
import { bundleKeys, supplierReturnSelectKeys } from "@/admin/queryKeys";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/api/apiClient";
import type { SlabInBundleDetail } from "@/interfaces/bundle.response";
import type { ReturnItemReason } from "@/interfaces/supplier-return.response";

const SLAB_STATUS_CONFIG: Record<
  SlabInBundleDetail["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  AVAILABLE: { label: "Available", variant: "default" },
  RESERVED: { label: "Reserved", variant: "secondary" },
  SOLD: { label: "Sold", variant: "outline" },
  RETURNED: { label: "Returned", variant: "destructive" },
};

const RETURN_REASONS: { value: ReturnItemReason; label: string }[] = [
  { value: "DEFECTIVE", label: "Defective" },
  { value: "BROKEN", label: "Broken" },
  { value: "WRONG_ITEM", label: "Wrong Item" },
  { value: "OTHER", label: "Other" },
];

const returnSlabSchema = z.object({
  reason: z.enum(["DEFECTIVE", "BROKEN", "WRONG_ITEM", "OTHER"]),
  unitCost: z.coerce.number().positive("Must be greater than 0"),
});
type ReturnSlabValues = z.infer<typeof returnSlabSchema>;

// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

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

// ---------------------------------------------------------------------------
// Return Slab Sheet
// ---------------------------------------------------------------------------

interface ReturnSlabSheetProps {
  slab: SlabInBundleDetail | null;
  bundleId: string;
  purchaseInvoiceId: string;
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ReturnSlabSheet({
  slab,
  bundleId,
  purchaseInvoiceId,
  supplierId,
  open,
  onOpenChange,
  onSuccess,
}: ReturnSlabSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnSlabValues>({
    resolver: zodResolver(returnSlabSchema) as Resolver<ReturnSlabValues>,
    defaultValues: { reason: "DEFECTIVE", unitCost: 0 },
  });

  const { data: draftReturns = [] } = useQuery({
    queryKey: supplierReturnSelectKeys.list({ purchaseInvoiceId, status: "DRAFT" }),
    queryFn: () => getSupplierReturnsForSelectAction({ purchaseInvoiceId, status: "DRAFT" }),
    enabled: open && !!purchaseInvoiceId,
  });

  const addItemMutation = useMutation({
    mutationFn: async (values: ReturnSlabValues) => {
      let returnId: string;
      const existingDraft = draftReturns[0];

      if (existingDraft) {
        returnId = existingDraft.id;
      } else {
        const created = await createSupplierReturnAction({
          supplierId,
          purchaseInvoiceId,
          returnDate: new Date().toISOString().split("T")[0],
        });
        returnId = created.id;
      }

      await addReturnItemAction(returnId, {
        slabId: slab!.id,
        bundleId,
        reason: values.reason,
        unitCost: values.unitCost,
      });

      return returnId;
    },
    onSuccess: (returnId) => {
      toast.success("Slab added to return", {
        action: {
          label: "View Return",
          onClick: () => window.open(`/purchasing/supplier-returns/${returnId}`, "_self"),
        },
      });
      reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add slab to return"));
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Return Slab</SheetTitle>
          <SheetDescription>
            {slab ? (
              <>
                Slab <span className="font-mono font-medium">{slab.code}</span> · {slab.dimensions}
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => { void handleSubmit((values) => addItemMutation.mutate(values))(e); }}
          className="flex flex-col gap-4 p-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.reason?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="unitCost">Unit Cost</FieldLabel>
              <Controller
                name="unitCost"
                control={control}
                render={({ field }) => (
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                )}
              />
              <FieldError>{errors.unitCost?.message}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={addItemMutation.isPending} className="w-full">
            {addItemMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Undo2Icon className="size-4" />
            )}
            Confirm Return
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export const BundleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [returningSlab, setReturningSlab] = useState<SlabInBundleDetail | null>(null);

  const {
    data: bundle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: bundleKeys.detail(id ?? ""),
    queryFn: () => getBundleByIdAction(id!),
    enabled: !!id,
  });

  const handleNotFound = useCallback(() => {
    void navigate("/bundles", { replace: true });
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: bundleKeys.detail(id ?? "") });
  }, [queryClient, id]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !bundle) {
    handleNotFound();
    return null;
  }

  const canReturn = !!bundle.purchaseInvoiceId;

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
              <Link to="/bundles">Bundles</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">
              {bundle.lotNumber ?? bundle.id.slice(0, 8) + "…"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers2Icon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {bundle.lotNumber ? `Lot ${bundle.lotNumber}` : "Bundle"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {bundle.productName} · {bundle.supplierName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/bundles">
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Info strip */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            <InfoItem
              label="Product"
              value={bundle.productName}
              icon={<PackageIcon className="size-3 shrink-0" />}
            />
            <InfoItem label="Supplier" value={bundle.supplierName} />
            {bundle.lotNumber && (
              <InfoItem label="Lot Number" value={bundle.lotNumber} />
            )}
            {bundle.thicknessCm != null && (
              <InfoItem label="Thickness" value={`${bundle.thicknessCm} cm`} />
            )}
            <InfoItem
              label="Invoice"
              value={bundle.invoiceNumber ?? undefined}
              icon={bundle.invoiceNumber ? <ReceiptIcon className="size-3 shrink-0" /> : undefined}
            />
            <InfoItem
              label="Created"
              value={formatDate(bundle.createdAt)}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem label="Slabs" value={String(bundle.slabs.length)} />
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="slabs" className="w-full">
        <TabsList>
          <TabsTrigger value="slabs">
            Slabs
            {bundle.slabs.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({bundle.slabs.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="slabs" className="mt-4">
          {bundle.slabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slabs in this bundle.</p>
          ) : (
            <Card className="py-0">
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">Dimensions</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="w-0" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bundle.slabs.map((slab) => {
                        const statusConfig = SLAB_STATUS_CONFIG[slab.status];
                        const returnable =
                          canReturn &&
                          (slab.status === "AVAILABLE" || slab.status === "RESERVED");
                        return (
                          <TableRow key={slab.id}>
                            <TableCell className="font-mono text-sm font-medium">
                              {slab.code}
                            </TableCell>
                            <TableCell className="tabular-nums text-sm">
                              {slab.dimensions}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {slab.description ?? "—"}
                            </TableCell>
                            <TableCell>
                              {returnable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReturningSlab(slab)}
                                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Undo2Icon className="size-3.5" />
                                  Return
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <BundleImageUpload
                bundleId={bundle.id}
                imagePublicId={bundle.imagePublicId ?? null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReturnSlabSheet
        slab={returningSlab}
        bundleId={bundle.id}
        purchaseInvoiceId={bundle.purchaseInvoiceId ?? ""}
        supplierId={bundle.supplierId}
        open={returningSlab !== null}
        onOpenChange={(v) => {
          if (!v) setReturningSlab(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
