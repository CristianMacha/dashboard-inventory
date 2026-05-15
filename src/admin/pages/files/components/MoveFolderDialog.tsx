import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { moveFolderAction } from "@/admin/actions/move-folder.action";
import { fileKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { FolderDto } from "@/interfaces/file.response";
import { FolderPicker } from "./FolderPicker";

interface MoveFolderDialogProps {
  folder: FolderDto | null;
  organizationId: string;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const MoveFolderDialog = ({
  folder,
  organizationId,
  onSuccess,
  onOpenChange,
}: MoveFolderDialogProps) => {
  const queryClient = useQueryClient();
  // undefined = nothing selected, null = root, string = folderId
  const [selectedParentId, setSelectedParentId] = useState<string | null | undefined>(undefined);

  const moveMutation = useMutation({
    mutationFn: () => moveFolderAction(folder!.id, organizationId, selectedParentId ?? null),
    onSuccess: () => {
      const oldParentId = folder?.parentId ?? null;
      const newParentId = selectedParentId ?? null;
      const toInvalidate = new Set([oldParentId, newParentId]);
      toInvalidate.forEach((pid) => {
        if (pid) {
          void queryClient.invalidateQueries({
            queryKey: [...fileKeys.all, "folder", pid, organizationId],
          });
        } else {
          void queryClient.invalidateQueries({
            queryKey: fileKeys.rootFolders(organizationId),
          });
        }
      });
      toast.success(`"${folder!.name}" moved successfully`);
      onSuccess();
      handleClose();
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to move folder")),
  });

  const handleClose = () => {
    setSelectedParentId(undefined);
    onOpenChange(false);
  };

  const isSameParent = selectedParentId === folder?.parentId ||
    (selectedParentId === null && folder?.parentId === null);
  const hasSelection = selectedParentId !== undefined;

  return (
    <Dialog open={!!folder} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            Move &ldquo;{folder?.name}&rdquo;
          </DialogTitle>
        </DialogHeader>

        <FolderPicker
          organizationId={organizationId}
          excludeIds={folder ? [folder.id] : []}
          selectedId={selectedParentId}
          onSelect={setSelectedParentId}
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => moveMutation.mutate()}
            disabled={!hasSelection || isSameParent || moveMutation.isPending}
          >
            {moveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
