import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
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
import { DataTable } from "@/admin/pages/products/DataTable";
import { useListPageState } from "@/admin/hooks/useListPageState";

import { getLevelsAction } from "@/admin/actions/get-levels.action";
import { updateLevelAction } from "@/admin/actions/update-level.action";
import { levelKeys } from "@/admin/queryKeys";
import type { LevelResponse } from "@/interfaces/level.response";

import { levelColumns } from "./Columns";
import { LevelFormSheet } from "./components/LevelFormSheet";

export const LevelsPage = () => {
  const queryClient = useQueryClient();

  const {
    sheetOpen,
    editingItem: editingLevel,
    openCreate,
    openEdit,
    handleSheetOpenChange,
  } = useListPageState<LevelResponse>();

  const { data, isLoading } = useQuery({
    queryKey: levelKeys.all,
    queryFn: getLevelsAction,
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (level: LevelResponse) =>
      updateLevelAction(level.id, { isActive: !level.isActive }),
    onSuccess: (_, level) => {
      void queryClient.invalidateQueries({ queryKey: levelKeys.all });
      toast.success(
        `Level ${level.isActive ? "deactivated" : "activated"} successfully`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update level status");
    },
  });

  const togglingId = toggleActiveMutation.isPending
    ? (toggleActiveMutation.variables?.id ?? null)
    : null;

  const columns = levelColumns({
    onEdit: openEdit,
    onToggleActive: (level) => toggleActiveMutation.mutate(level),
    togglingId,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Levels</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          Add Level
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          emptyMessage="No levels found. Add your first level to get started."
        />
      </div>

      <LevelFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editingLevel={editingLevel}
      />
    </div>
  );
};
