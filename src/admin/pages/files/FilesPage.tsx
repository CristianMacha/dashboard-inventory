import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Download,
  Eye,
  File,
  FolderOpen,
  FolderPlus,
  Home,
  Loader2,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-error";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { getOrganizationsAction } from "@/admin/actions/get-organizations.action";
import { getRootFoldersAction } from "@/admin/actions/get-root-folders.action";
import { getFolderContentsAction } from "@/admin/actions/get-folder-contents.action";
import { createFolderAction } from "@/admin/actions/create-folder.action";
import { uploadFileAction } from "@/admin/actions/upload-file.action";
import { deleteFileAction } from "@/admin/actions/delete-file.action";
import { getFileUrlAction } from "@/admin/actions/get-file-url.action";
import { useFolderAncestors } from "@/admin/hooks/useFolderAncestors";
import { fileKeys, organizationKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { FileRecordDto, FolderDto } from "@/interfaces/file.response";
import { FileTagsDialog } from "./components/FileTagsDialog";
import { FilePreviewDialog } from "./components/FilePreviewDialog";
import { FileHoverPreview } from "./components/FileHoverPreview";

const PAGE_LIMIT = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FilesPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [organizationId, setOrganizationId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [tagsFile, setTagsFile] = useState<FileRecordDto | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRecordDto | null>(null);

  const currentFolderId = searchParams.get("folderId");
  const isAtRoot = !currentFolderId;

  // Reconstruct breadcrumb from URL folderId on page load
  const { stack: folderStack, isLoading: ancestorsLoading } = useFolderAncestors(
    currentFolderId,
    organizationId,
  );
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: organizationKeys.all,
    queryFn: getOrganizationsAction,
    select: (data) => {
      if (!organizationId && data.length > 0) {
        setOrganizationId(data[0].id);
      }
      return data;
    },
  });

  const { data: rootFolders, isLoading: rootFoldersLoading } = useQuery({
    queryKey: fileKeys.rootFolders(organizationId),
    queryFn: () => getRootFoldersAction(organizationId),
    enabled: !!organizationId && isAtRoot,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: fileKeys.folderContents(currentFolderId ?? "", organizationId, page),
    queryFn: () =>
      getFolderContentsAction(currentFolderId!, organizationId, page, PAGE_LIMIT),
    enabled: !!currentFolderId && !!organizationId,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await createFolderAction({
        name,
        organizationId,
        parentId: currentFolderId ?? undefined,
      });
      return { id: result.id, name };
    },
    onSuccess: ({ id: _id, name }) => {
      if (isAtRoot) {
        void queryClient.invalidateQueries({ queryKey: fileKeys.rootFolders(organizationId) });
      } else {
        void queryClient.invalidateQueries({
          queryKey: fileKeys.folderContents(currentFolderId!, organizationId, page),
        });
      }
      toast.success(`Folder "${name}" created`);
      setNewFolderOpen(false);
      setNewFolderName("");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create folder"));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadFileAction(currentFolderId!, organizationId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fileKeys.folderContents(currentFolderId!, organizationId, page),
      });
      toast.success("File uploaded");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload file"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteFileAction(fileId, organizationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fileKeys.folderContents(currentFolderId!, organizationId, page),
      });
      toast.success("File deleted");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete file"));
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (fileId: string) => getFileUrlAction(fileId, organizationId),
    onSuccess: (url) => {
      window.open(url, "_blank");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to get download URL"));
    },
  });

  const navigateInto = (folder: FolderDto) => {
    setSearchParams({ folderId: folder.id });
    setPage(1);
  };

  const navigateTo = (folder: FolderDto) => {
    setSearchParams({ folderId: folder.id });
    setPage(1);
  };

  const navigateHome = () => {
    setSearchParams({});
    setPage(1);
  };

  const handleOrgChange = (v: string) => {
    setOrganizationId(v);
    setSearchParams({});
    setPage(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  };

  const displayedSubfolders = isAtRoot ? (rootFolders ?? []) : (data?.subfolders ?? []);

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
              <BreadcrumbPage>Files</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Link
          to="/files/search"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Search files
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Label className="shrink-0">Organization</Label>
        {orgsLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <Select value={organizationId} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {orgs?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {organizationId && (
        <>
          {/* Folder breadcrumb navigation */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button
              onClick={navigateHome}
              className="hover:text-foreground flex items-center gap-1"
            >
              <Home className="size-4" />
              Root
            </button>
            {ancestorsLoading && currentFolderId ? (
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                <Skeleton className="h-4 w-24" />
              </span>
            ) : (
              folderStack.map((folder, i) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3" />
                  {i < folderStack.length - 1 ? (
                    <button
                      onClick={() => navigateTo(folder)}
                      className="hover:text-foreground"
                    >
                      {folder.name}
                    </button>
                  ) : (
                    <span className="text-foreground font-medium">{folder.name}</span>
                  )}
                </span>
              ))
            )}
          </div>

          {/* Action bar */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewFolderOpen(true)}
            >
              <FolderPlus className="size-4" />
              New Folder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAtRoot || uploadMutation.isPending}
              title={isAtRoot ? "Open a folder first to upload files into it" : undefined}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Content area */}
          <div className="rounded-md border">
            {isAtRoot ? (
              <div className="divide-y">
                {rootFoldersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="size-5 rounded" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))
                ) : displayedSubfolders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    <p>No root folders yet.</p>
                    <p className="mt-1">
                      Use <strong>New Folder</strong> to create one, then open it to upload files.
                    </p>
                  </div>
                ) : (
                  displayedSubfolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => navigateInto(folder)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <FolderOpen className="size-5 text-amber-500 shrink-0" />
                      <span className="flex-1 text-sm font-medium">{folder.name}</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            ) : isError ? (
              <QueryError onRetry={() => void refetch()} />
            ) : (
              <>
                <div className="divide-y">
                  {isLoading || ancestorsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="size-5 rounded" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))
                  ) : (
                    <>
                      {data?.subfolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => navigateInto(folder)}
                          className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <FolderOpen className="size-5 text-amber-500 shrink-0" />
                          <span className="flex-1 text-sm font-medium">{folder.name}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                      ))}
                      {data?.files.data.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                        >
                          <FileHoverPreview file={file} organizationId={organizationId}>
                            <File className="size-5 text-blue-500 shrink-0 cursor-pointer" />
                          </FileHoverPreview>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.mimeType} · {formatBytes(file.sizeBytes)}
                              {file.tags.length > 0 && (
                                <span className="ml-2">
                                  {file.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="inline-block bg-secondary text-secondary-foreground rounded px-1 py-0 text-xs mr-1"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => setPreviewFile(file)}
                              title="Preview"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => setTagsFile(file)}
                              title="Manage tags"
                            >
                              <Tag className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => downloadMutation.mutate(file.id)}
                              disabled={downloadMutation.isPending}
                              title="Download"
                            >
                              <Download className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => deleteMutation.mutate(file.id)}
                              disabled={deleteMutation.isPending}
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {data?.subfolders.length === 0 && data?.files.data.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          This folder is empty. Use <strong>Upload File</strong> to add files.
                        </div>
                      )}
                    </>
                  )}
                </div>
                {data && data.files.totalPages > 1 && (
                  <div className="border-t p-4 bg-muted">
                    <CustomPagination
                      page={page}
                      totalPages={data.files.totalPages}
                      totalCount={data.files.total}
                      pageSize={PAGE_LIMIT}
                      itemLabel="files"
                      onPageChange={setPage}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <FilePreviewDialog
        file={previewFile}
        organizationId={organizationId}
        onOpenChange={(open) => { if (!open) setPreviewFile(null); }}
      />

      <FileTagsDialog
        file={tagsFile}
        organizationId={organizationId}
        folderId={currentFolderId ?? ""}
        page={page}
        onOpenChange={(open) => { if (!open) setTagsFile(null); }}
      />

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAtRoot ? "New Root Folder" : `New Folder in "${currentFolder?.name}"`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim()) {
                  createFolderMutation.mutate(newFolderName.trim());
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createFolderMutation.mutate(newFolderName.trim())}
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
            >
              {createFolderMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
