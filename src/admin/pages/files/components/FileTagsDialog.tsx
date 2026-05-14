import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addFileTagsAction } from "@/admin/actions/add-file-tags.action";
import { removeFileTagsAction } from "@/admin/actions/remove-file-tags.action";
import { getFolderContentsAction } from "@/admin/actions/get-folder-contents.action";
import { fileKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { FileRecordDto } from "@/interfaces/file.response";

interface FileTagsDialogProps {
  file: FileRecordDto | null;
  organizationId: string;
  folderId: string;
  page: number;
  onOpenChange: (open: boolean) => void;
}

export const FileTagsDialog = ({
  file,
  organizationId,
  folderId,
  page,
  onOpenChange,
}: FileTagsDialogProps) => {
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");

  // Read the live file record from the folder query so tags update immediately after mutations
  const { data: liveFile } = useQuery({
    queryKey: fileKeys.folderContents(folderId, organizationId, page),
    queryFn: () => getFolderContentsAction(folderId, organizationId, page, 20),
    enabled: !!file && !!folderId && !!organizationId,
    select: (d) => d.files.data.find((f) => f.id === file?.id) ?? file,
  });

  const currentFile = liveFile ?? file;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: fileKeys.folderContents(folderId, organizationId, page),
    });

  const addMutation = useMutation({
    mutationFn: (tags: string[]) => addFileTagsAction(file!.id, organizationId, tags),
    onSuccess: () => {
      void invalidate();
      toast.success("Tag added");
      setTagInput("");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add tag"));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (tag: string) => removeFileTagsAction(file!.id, organizationId, [tag]),
    onSuccess: () => {
      void invalidate();
      toast.success("Tag removed");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to remove tag"));
    },
  });

  const handleAdd = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (currentFile?.tags.includes(tag)) {
      toast.error("Tag already exists");
      return;
    }
    addMutation.mutate([...(currentFile?.tags ?? []), tag]);
  };

  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-4" />
            Manage Tags — {currentFile?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Current tags</Label>
            {currentFile?.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {currentFile?.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => removeMutation.mutate(tag)}
                      disabled={removeMutation.isPending}
                      className="ml-1 hover:text-destructive disabled:opacity-50"
                    >
                      {removeMutation.isPending && removeMutation.variables === tag ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tag-input">Add tag</Label>
            <div className="flex gap-2">
              <Input
                id="tag-input"
                placeholder="e.g. factura, contrato..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <Button
                onClick={handleAdd}
                disabled={!tagInput.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
