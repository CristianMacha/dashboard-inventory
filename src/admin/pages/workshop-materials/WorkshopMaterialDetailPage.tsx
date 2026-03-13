import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  BoxIcon,
  Pencil,
  Loader2,
  CalendarIcon,
  TagIcon,
  ScaleIcon,
  AlertTriangleIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryError } from "@/components/ui/query-error";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";

import { getWorkshopMaterialByIdAction } from "@/admin/actions/get-workshop-material-by-id.action";
import { getWorkshopMaterialMovementsAction } from "@/admin/actions/get-workshop-material-movements.action";
import { registerMaterialMovementAction } from "@/admin/actions/register-material-movement.action";
import { workshopMaterialKeys } from "@/admin/queryKeys";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { getErrorMessage } from "@/api/apiClient";
import { WorkshopMaterialFormSheet } from "./components/WorkshopMaterialFormSheet";
import type { MaterialMovementReason } from "@/interfaces/workshop-material.response";

const MOVEMENT_REASONS: { value: MaterialMovementReason; label: string }[] = [
  { value: "compra", label: "Purchase" },
  { value: "uso_job", label: "Job Use" },
  { value: "devolucion", label: "Return" },
  { value: "ajuste_inventario", label: "Inventory Adjustment" },
  { value: "otro", label: "Other" },
];

const REASON_LABELS: Record<MaterialMovementReason, string> = {
  compra: "Purchase",
  uso_job: "Job Use",
  devolucion: "Return",
  ajuste_inventario: "Inventory Adjustment",
  otro: "Other",
};

const MOVEMENTS_LIMIT = 15;

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
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export const WorkshopMaterialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementDelta, setMovementDelta] = useState("");
  const [movementReason, setMovementReason] =
    useState<MaterialMovementReason>("compra");
  const [movementNotes, setMovementNotes] = useState("");

  const {
    data: material,
    isLoading: materialLoading,
    isError: materialError,
    refetch: refetchMaterial,
  } = useQuery({
    queryKey: workshopMaterialKeys.detail(id!),
    queryFn: () => getWorkshopMaterialByIdAction(id!),
    enabled: !!id,
  });

  const {
    data: movements,
    isLoading: movementsLoading,
    isError: movementsError,
    refetch: refetchMovements,
  } = useQuery({
    queryKey: [...workshopMaterialKeys.movements(id!), movementsPage],
    queryFn: () =>
      getWorkshopMaterialMovementsAction(id!, {
        page: movementsPage,
        limit: MOVEMENTS_LIMIT,
      }),
    enabled: !!id,
  });

  const registerMovementMutation = useMutation({
    mutationFn: ({
      delta,
      reason,
      notes,
    }: {
      delta: number;
      reason: MaterialMovementReason;
      notes?: string;
    }) => registerMaterialMovementAction(id!, { delta, reason, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: workshopMaterialKeys.detail(id!),
      });
      void queryClient.invalidateQueries({
        queryKey: workshopMaterialKeys.movements(id!),
      });
      void queryClient.invalidateQueries({
        queryKey: workshopMaterialKeys.lists(),
      });
      toast.success("Movement registered");
      setMovementDelta("");
      setMovementNotes("");
      setMovementReason("compra");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to register movement"));
    },
  });

  if (materialLoading) return <DetailSkeleton />;

  if (materialError) {
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
                <Link to="/workshop/materials">Workshop Materials</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QueryError onRetry={() => void refetchMaterial()} />
      </div>
    );
  }

  const stockBelowMin = material!.currentStock <= material!.minStock;
  const parsedDelta = Number(movementDelta);
  const applyDisabled =
    registerMovementMutation.isPending ||
    !movementDelta ||
    isNaN(parsedDelta) ||
    parsedDelta === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
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
              <Link to="/workshop/materials">Workshop Materials</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{material!.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden">
            {material!.imagePublicId ? (
              <img
                src={getCloudinaryUrl(material!.imagePublicId, 96)}
                alt={material!.name}
                className="size-full object-cover"
              />
            ) : (
              <BoxIcon className="size-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">
                {material!.name}
              </h1>
              {stockBelowMin && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangleIcon className="size-3" />
                  Low Stock
                </Badge>
              )}
            </div>
            {material!.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {material!.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => void navigate(-1)}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Info strip */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            <InfoItem
              label="Current Stock"
              value={`${material!.currentStock} ${material!.unit}`}
              icon={<ScaleIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Min. Stock"
              value={`${material!.minStock} ${material!.unit}`}
            />
            <InfoItem label="Unit" value={material!.unit} />
            <InfoItem
              label="Unit Price"
              value={
                material!.unitPrice != null
                  ? `$${material!.unitPrice.toLocaleString()}`
                  : null
              }
              icon={<TagIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Created"
              value={new Date(material!.createdAt).toLocaleDateString()}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Register Movement */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Register Movement</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Select
                value={movementReason}
                onValueChange={(v) =>
                  setMovementReason(v as MaterialMovementReason)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                value={movementDelta}
                onChange={(e) => setMovementDelta(e.target.value)}
                placeholder={`Qty (+ entry, – exit) · ${material!.unit}`}
              />
              <Input
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="Notes (optional)"
                autoComplete="off"
              />
              <Button
                disabled={applyDisabled}
                onClick={() =>
                  registerMovementMutation.mutate({
                    delta: parsedDelta,
                    reason: movementReason,
                    notes: movementNotes || undefined,
                  })
                }
              >
                {registerMovementMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Apply
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Movement History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Movement History</CardTitle>
                {movements && (
                  <span className="text-xs text-muted-foreground">
                    {movements.total} total
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {movementsError ? (
                <div className="px-6 pb-4">
                  <QueryError onRetry={() => void refetchMovements()} />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Delta</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : movements?.data.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No movements recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements?.data.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm tabular-nums">
                            {new Date(m.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold tabular-nums text-sm ${m.delta > 0 ? "text-green-600" : "text-destructive"}`}
                            >
                              {m.delta > 0 ? `+${m.delta}` : m.delta}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {REASON_LABELS[m.reason]}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {m.notes ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              {movements && (
                <div className="border-t px-4 py-3">
                  <CustomPagination
                    page={movementsPage}
                    totalPages={movements.totalPages}
                    totalCount={movements.total}
                    pageSize={MOVEMENTS_LIMIT}
                    itemLabel="movements"
                    onPageChange={setMovementsPage}
                    disabled={movementsLoading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {material && (
        <WorkshopMaterialFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          editingMaterial={material}
          page={1}
          limit={100}
        />
      )}
    </div>
  );
};
