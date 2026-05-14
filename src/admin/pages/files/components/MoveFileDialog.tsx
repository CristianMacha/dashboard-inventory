import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FolderOpen, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { getRootFoldersAction } from "@/admin/actions/get-root-folders.action";
import { getFolderContentsAction } from "@/admin/actions/get-folder-contents.action";
import { moveFileAction } from "@/admin/actions/move-file.action";
import { fileKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { FileRecordDto, FolderDto } from "@/interfaces/file.response";

interface MoveFileDialogProps {
  file: FileRecordDto | null;
  organizationId: string;
  currentFolderId: string | null;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const MoveFileDialog = ({
  file,
  organizationId,
  currentFolderId,
  onSuccess,
  onOpenChange,
}: MoveFileDialogProps) => {
  const queryClient = useQueryClient();
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderDto[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const isAtRoot = !browseFolderId;

  const { data: rootFolders, isLoading: rootLoading } = useQuery({
    queryKey: fileKeys.rootFolders(organizationId),
    queryFn: () => getRootFoldersAction(organizationId),
    enabled: !!organizationId && isAtRoot && !!file,
  });

  const { data: folderContents, isLoading: contentsLoading } = useQuery({
    queryKey: fileKeys.folderContents(browseFolderId ?? "", organizationId, 1),
    queryFn: () => getFolderContentsAction(browseFolderId!, organizationId, 1, 100),
    enabled: !!browseFolderId && !!organizationId && !!file,
  });

  const isLoading = rootLoading || contentsLoading;
  const subfolders: FolderDto[] = isAtRoot
    ? (rootFolders ?? [])
    : (folderContents?.subfolders ?? []);

  const moveMutation = useMutation({
    mutationFn: () => moveFileAction(file!.id, organizationId, selectedFolderId!),
    onSuccess: (_data, _vars, _ctx) => {
      // Invalidate all pages of both source and destination folders
      const queriesToInvalidate: string[][] = [];
      if (currentFolderId) {
        queriesToInvalidate.push([...fileKeys.all, "folder", currentFolderId, organizationId]);
      }
      if (selectedFolderId) {
        queriesToInvalidate.push([...fileKeys.all, "folder", selectedFolderId, organizationId]);
      }
      void Promise.all(
        queriesToInvalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      toast.success(`"${file!.name}" moved successfully`);
      onSuccess();
      handleClose();
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e, "Failed to move file")),
  });

  const handleClose = () => {
    setBrowseFolderId(null);
    setBreadcrumb([]);
    setSelectedFolderId(null);
    onOpenChange(false);
  };

  const navigateInto = (folder: FolderDto) => {
    setBrowseFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, folder]);
    setSelectedFolderId(null);
  };

  const navigateHome = () => {
    setBrowseFolderId(null);
    setBreadcrumb([]);
    setSelectedFolderId(null);
  };

  const navigateTo = (folder: FolderDto, index: number) => {
    setBrowseFolderId(folder.id);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
    setSelectedFolderId(null);
  };

  const currentFolder = breadcrumb[breadcrumb.length - 1] ?? null;
  const isSameFolder = selectedFolderId === file?.folderId;

  return (
    <Dialog open={!!file} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            Move &ldquo;{file?.name}&rdquo;
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumb nav */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <button
            onClick={navigateHome}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Home className="size-3.5" />
            Root
          </button>
          {breadcrumb.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              {i < breadcrumb.length - 1 ? (
                <button
                  onClick={() => navigateTo(f, i)}
                  className="hover:text-foreground"
                >
                  {f.name}
                </button>
              ) : (
                <span className="text-foreground font-medium">{f.name}</span>
              )}
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="rounded-md border min-h-[200px] max-h-[320px] overflow-y-auto">
          {/* Current folder as selectable destination (if not root) */}
          {currentFolder && (
            <button
              onClick={() => setSelectedFolderId(browseFolderId)}
              className={`flex w-full items-center gap-2 p-3 text-sm border-b transition-colors ${
                selectedFolderId === browseFolderId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <FolderOpen className="size-4 text-amber-500 shrink-0" />
              <span className="font-medium">Move here — &ldquo;{currentFolder.name}&rdquo;</span>
            </button>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : subfolders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAtRoot ? "No root folders." : "No subfolders."}
            </div>
          ) : (
            <div className="divide-y">
              {subfolders.map((folder) => (
                <div key={folder.id} className="flex items-center">
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex flex-1 items-center gap-2 p-3 text-sm transition-colors ${
                      selectedFolderId === folder.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    } ${folder.id === file?.folderId ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={folder.id === file?.folderId}
                  >
                    <FolderOpen className="size-4 text-amber-500 shrink-0" />
                    <span className="flex-1 text-left truncate">{folder.name}</span>
                    {folder.id === file?.folderId && (
                      <span className="text-xs text-muted-foreground">(current)</span>
                    )}
                  </button>
                  <button
                    onClick={() => navigateInto(folder)}
                    className="px-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    title="Browse subfolders"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => moveMutation.mutate()}
            disabled={!selectedFolderId || isSameFolder || moveMutation.isPending}
          >
            {moveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
