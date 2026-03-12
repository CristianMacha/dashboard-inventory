import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, Pencil, WrenchIcon, Loader2, CalendarIcon, TagIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

import { getWorkshopToolByIdAction } from "@/admin/actions/get-workshop-tool-by-id.action";
import { getWorkshopToolMovementsAction } from "@/admin/actions/get-workshop-tool-movements.action";
import { changeWorkshopToolStatusAction } from "@/admin/actions/change-workshop-tool-status.action";
import { workshopToolKeys } from "@/admin/queryKeys";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ApiError } from "@/api/apiClient";
import { WorkshopToolFormSheet } from "./components/WorkshopToolFormSheet";
import type { WorkshopToolStatus } from "@/interfaces/workshop-tool.response";

const TOOL_STATUSES: { value: WorkshopToolStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "in_repair", label: "In Repair" },
  { value: "retired", label: "Retired" },
];

const STATUS_LABELS: Record<WorkshopToolStatus, string> = {
  available: "Available",
  in_use: "In Use",
  in_repair: "In Repair",
  retired: "Retired",
};

const STATUS_VARIANTS: Record<WorkshopToolStatus, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  in_use: "secondary",
  in_repair: "outline",
  retired: "destructive",
};

const MOVEMENTS_LIMIT = 15;

function InfoItem({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <dt className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</dt>
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

export const WorkshopToolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<WorkshopToolStatus | "">("");
  const [statusNotes, setStatusNotes] = useState("");

  const {
    data: tool,
    isLoading: toolLoading,
    isError: toolError,
    refetch: refetchTool,
  } = useQuery({
    queryKey: workshopToolKeys.detail(id!),
    queryFn: () => getWorkshopToolByIdAction(id!),
    enabled: !!id,
  });

  const {
    data: movements,
    isLoading: movementsLoading,
    isError: movementsError,
    refetch: refetchMovements,
  } = useQuery({
    queryKey: [...workshopToolKeys.movements(id!), movementsPage],
    queryFn: () => getWorkshopToolMovementsAction(id!, { page: movementsPage, limit: MOVEMENTS_LIMIT }),
    enabled: !!id,
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ newStatus, notes }: { newStatus: WorkshopToolStatus; notes?: string }) =>
      changeWorkshopToolStatusAction(id!, { newStatus, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.detail(id!) });
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.movements(id!) });
      void queryClient.invalidateQueries({ queryKey: workshopToolKeys.lists() });
      toast.success("Status updated");
      setSelectedStatus("");
      setStatusNotes("");
    },
    onError: (error: Error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update status");
    },
  });

  if (toolLoading) return <DetailSkeleton />;

  if (toolError) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/workshop/tools">Workshop Tools</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Detail</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QueryError onRetry={() => void refetchTool()} />
      </div>
    );
  }

  const applyDisabled =
    changeStatusMutation.isPending || !selectedStatus || selectedStatus === tool?.status;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/workshop/tools">Workshop Tools</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{tool!.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden">
            {tool!.imagePublicId ? (
              <img
                src={getCloudinaryUrl(tool!.imagePublicId, 96)}
                alt={tool!.name}
                className="size-full object-cover"
              />
            ) : (
              <WrenchIcon className="size-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold leading-tight">{tool!.name}</h1>
              <Badge variant={STATUS_VARIANTS[tool!.status]}>
                {STATUS_LABELS[tool!.status]}
              </Badge>
            </div>
            {tool!.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{tool!.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
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
              label="Purchase Price"
              value={tool!.purchasePrice != null ? `$${tool!.purchasePrice.toLocaleString()}` : null}
              icon={<TagIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Created"
              value={new Date(tool!.createdAt).toLocaleDateString()}
              icon={<CalendarIcon className="size-3 shrink-0" />}
            />
            <InfoItem
              label="Last Updated"
              value={new Date(tool!.updatedAt).toLocaleDateString()}
            />
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Change Status */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as WorkshopToolStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_STATUSES.filter((s) => s.value !== tool!.status).map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="min-h-[70px] resize-none"
              />
              <Button
                disabled={applyDisabled}
                onClick={() =>
                  changeStatusMutation.mutate({
                    newStatus: selectedStatus as WorkshopToolStatus,
                    notes: statusNotes || undefined,
                  })
                }
              >
                {changeStatusMutation.isPending && <Loader2 className="size-4 animate-spin" />}
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
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : movements?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
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
                            <Badge variant={STATUS_VARIANTS[m.previousStatus]} className="text-xs">
                              {STATUS_LABELS[m.previousStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANTS[m.newStatus]} className="text-xs">
                              {STATUS_LABELS[m.newStatus]}
                            </Badge>
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

      {tool && (
        <WorkshopToolFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          editingTool={tool}
          page={1}
          limit={100}
        />
      )}
    </div>
  );
};
