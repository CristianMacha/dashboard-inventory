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

import { bulkMoveFilesAction } from "@/admin/actions/bulk-move-files.action";
import { fileKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import { FolderPicker } from "./FolderPicker";

interface BulkMoveDialogProps {
  open: boolean;
  fileIds: string[];
  organizationId: string;
  currentFolderId: string | null;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const BulkMoveDialog = ({
  open,
  fileIds,
  organizationId,
  currentFolderId,
  onSuccess,
  onOpenChange,
}: BulkMoveDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null | undefined>(undefined);

  const moveMutation = useMutation({
    mutationFn: () => bulkMoveFilesAction(organizationId, fileIds, selectedFolderId!),
    onSuccess: (result) => {
      const toInvalidate: string[][] = [];
      if (currentFolderId) {
        toInvalidate.push([...fileKeys.all, "folder", currentFolderId, organizationId]);
      }
      if (selectedFolderId) {
        toInvalidate.push([...fileKeys.all, "folder", selectedFolderId, organizationId]);
      }
      void Promise.all(
        toInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      toast.success(`${result.moved} file${result.moved !== 1 ? "s" : ""} moved successfully`);
      onSuccess();
      handleClose();
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to move files")),
  });

  const handleClose = () => {
    setSelectedFolderId(undefined);
    onOpenChange(false);
  };

  const hasSelection = selectedFolderId !== undefined && selectedFolderId !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Move {fileIds.length} file{fileIds.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <FolderPicker
          organizationId={organizationId}
          selectedId={selectedFolderId}
          onSelect={setSelectedFolderId}
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => moveMutation.mutate()}
            disabled={!hasSelection || moveMutation.isPending}
          >
            {moveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
