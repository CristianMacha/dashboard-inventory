import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  Download,
  Eye,
  File,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Home,
  LayoutGrid,
  LayoutList,
  Loader2,
  Pencil,
  Tag,
  Trash2,
  Upload,
  X,
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
import { renameFolderAction } from "@/admin/actions/rename-folder.action";
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
import { FileGridCard } from "./components/FileGridCard";
import { StorageUsageBar } from "./components/StorageUsageBar";
import { MoveFileDialog } from "./components/MoveFileDialog";

const PAGE_LIMIT = 20;

type ViewMode = "list" | "grid";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File actions ─────────────────────────────────────────────────────────────

interface FileActionsProps {
  onPreview: () => void;
  onTags: () => void;
  onMove: () => void;
  onDownload: () => void;
  onDelete: () => void;
  downloading: boolean;
  deleting: boolean;
  overlay?: boolean;
}

function FileActions({
  onPreview,
  onTags,
  onMove,
  onDownload,
  onDelete,
  downloading,
  deleting,
  overlay = false,
}: FileActionsProps) {
  const base = overlay
    ? "size-8 text-white hover:text-white hover:bg-white/20"
    : "size-8";
  return (
    <>
      <Button variant="ghost" size="icon" className={base} onClick={onPreview} title="Preview">
        <Eye className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className={base} onClick={onTags} title="Manage tags">
        <Tag className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" className={base} onClick={onMove} title="Move to folder">
        <FolderInput className="size-4" />
      </Button>
      <Button
        variant="ghost" size="icon" className={base}
        onClick={onDownload} disabled={downloading} title="Download"
      >
        <Download className="size-4" />
      </Button>
      <Button
        variant="ghost" size="icon"
        className={overlay ? `${base} hover:bg-red-500/40` : "size-8 text-destructive hover:text-destructive"}
        onClick={onDelete} disabled={deleting} title="Delete"
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const FilesPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [organizationId, setOrganizationId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [tagsFile, setTagsFile] = useState<FileRecordDto | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRecordDto | null>(null);
  const [moveFile, setMoveFile] = useState<FileRecordDto | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  const currentFolderId = searchParams.get("folderId");
  const isAtRoot = !currentFolderId;

  const { stack: folderStack, isLoading: ancestorsLoading } =
    useFolderAncestors(currentFolderId, organizationId);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: organizationKeys.all,
    queryFn: getOrganizationsAction,
    select: (data) => {
      if (!organizationId && data.length > 0) setOrganizationId(data[0].id);
      return data;
    },
  });

  const { data: rootFolders, isLoading: rootFoldersLoading } = useQuery({
    queryKey: fileKeys.rootFolders(organizationId),
    queryFn: () => getRootFoldersAction(organizationId),
    enabled: !!organizationId && isAtRoot,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: fileKeys.folderContents(
      currentFolderId ?? "",
      organizationId,
      page,
    ),
    queryFn: () =>
      getFolderContentsAction(
        currentFolderId!,
        organizationId,
        page,
        PAGE_LIMIT,
      ),
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
      void queryClient.invalidateQueries({
        queryKey: isAtRoot
          ? fileKeys.rootFolders(organizationId)
          : fileKeys.folderContents(currentFolderId!, organizationId, page),
      });
      toast.success(`Folder "${name}" created`);
      setNewFolderOpen(false);
      setNewFolderName("");
    },
    onError: (e: unknown) =>
      toast.error(getErrorMessage(e, "Failed to create folder")),
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
      renameFolderAction(folderId, organizationId, name),
    onSuccess: (_data, { name }) => {
      void queryClient.invalidateQueries({
        queryKey: isAtRoot
          ? fileKeys.rootFolders(organizationId)
          : fileKeys.folderContents(currentFolderId!, organizationId, page),
      });
      toast.success(`Folder renamed to "${name}"`);
      setRenamingFolderId(null);
      setRenamingValue("");
    },
    onError: (e: unknown) =>
      toast.error(getErrorMessage(e, "Failed to rename folder")),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadFileAction(currentFolderId!, organizationId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fileKeys.folderContents(
          currentFolderId!,
          organizationId,
          page,
        ),
      });
      toast.success("File uploaded");
    },
    onError: (e: unknown) =>
      toast.error(getErrorMessage(e, "Failed to upload file")),
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteFileAction(fileId, organizationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fileKeys.folderContents(
          currentFolderId!,
          organizationId,
          page,
        ),
      });
      toast.success("File deleted");
    },
    onError: (e: unknown) =>
      toast.error(getErrorMessage(e, "Failed to delete file")),
  });

  const downloadMutation = useMutation({
    mutationFn: (fileId: string) => getFileUrlAction(fileId, organizationId),
    onSuccess: (url) => window.open(url, "_blank"),
    onError: (e: unknown) =>
      toast.error(getErrorMessage(e, "Failed to get download URL")),
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

  const displayedSubfolders = isAtRoot
    ? (rootFolders ?? [])
    : (data?.subfolders ?? []);
  const contentLoading = isLoading || ancestorsLoading;

  const startRename = (folder: FolderDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFolderId(folder.id);
    setRenamingValue(folder.name);
  };

  const commitRename = (folderId: string) => {
    const trimmed = renamingValue.trim();
    if (trimmed) renameFolderMutation.mutate({ folderId, name: trimmed });
    else cancelRename();
  };

  const cancelRename = () => {
    setRenamingFolderId(null);
    setRenamingValue("");
  };

  // ── Folder row/card (shared between modes) ──────────────────────────────────
  const FolderItem = ({ folder }: { folder: FolderDto }) => {
    const isRenaming = renamingFolderId === folder.id;

    if (viewMode === "list") {
      return isRenaming ? (
        <div className="flex w-full items-center gap-2 p-3 bg-muted/30">
          <FolderOpen className="size-5 text-amber-500 shrink-0" />
          <Input
            className="h-7 text-sm flex-1"
            value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(folder.id);
              if (e.key === "Escape") cancelRename();
            }}
            autoFocus
          />
          <Button
            variant="ghost" size="icon" className="size-7 text-green-600 hover:text-green-600"
            onClick={() => commitRename(folder.id)}
            disabled={renameFolderMutation.isPending}
          >
            {renameFolderMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={cancelRename}>
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="group flex w-full items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
          <FolderOpen className="size-5 text-amber-500 shrink-0" />
          <button
            className="flex-1 text-sm font-medium text-left truncate"
            onClick={() => navigateInto(folder)}
          >
            {folder.name}
          </button>
          <Button
            variant="ghost" size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => startRename(folder, e)}
            title="Rename"
          >
            <Pencil className="size-3.5" />
          </Button>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </div>
      );
    }

    // Grid mode
    return isRenaming ? (
      <div className="flex flex-col rounded-lg border overflow-hidden">
        <div className="aspect-square flex items-center justify-center bg-amber-50 dark:bg-amber-950/20">
          <FolderOpen className="size-12 text-amber-500" />
        </div>
        <div className="p-2 border-t flex flex-col gap-1">
          <Input
            className="h-6 text-xs px-1"
            value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(folder.id);
              if (e.key === "Escape") cancelRename();
            }}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              variant="ghost" size="icon" className="size-6 text-green-600 hover:text-green-600"
              onClick={() => commitRename(folder.id)}
              disabled={renameFolderMutation.isPending}
            >
              {renameFolderMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="size-6" onClick={cancelRename}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    ) : (
      <div className="group relative flex flex-col rounded-lg border overflow-hidden hover:border-amber-400/60 hover:bg-muted/30 transition-colors">
        <button
          className="flex flex-col w-full"
          onClick={() => navigateInto(folder)}
        >
          <div className="aspect-square flex items-center justify-center bg-amber-50 dark:bg-amber-950/20">
            <FolderOpen className="size-12 text-amber-500" />
          </div>
          <div className="p-2 border-t">
            <span className="text-xs font-medium truncate block w-full">{folder.name}</span>
          </div>
        </button>
        <Button
          variant="ghost" size="icon"
          className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          onClick={(e) => startRename(folder, e)}
          title="Rename"
        >
          <Pencil className="size-3" />
        </Button>
      </div>
    );
  };

  // ── File row (list mode) ─────────────────────────────────────────────────────
  const FileListItem = ({ file }: { file: FileRecordDto }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
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
        <FileActions
          onPreview={() => setPreviewFile(file)}
          onTags={() => setTagsFile(file)}
          onMove={() => setMoveFile(file)}
          onDownload={() => downloadMutation.mutate(file.id)}
          onDelete={() => deleteMutation.mutate(file.id)}
          downloading={downloadMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );

  // ── File card (grid mode) — uses shared FileGridCard ────────────────────────
  const renderFileGridCard = (file: FileRecordDto) => (
    <FileGridCard
      key={file.id}
      file={file}
      organizationId={organizationId}
      onPreview={() => setPreviewFile(file)}
      onTags={() => setTagsFile(file)}
      onMove={() => setMoveFile(file)}
      onDownload={() => downloadMutation.mutate(file.id)}
      onDelete={() => deleteMutation.mutate(file.id)}
      downloading={downloadMutation.isPending}
      deleting={deleteMutation.isPending}
    />
  );

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
          to="/files-search"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Search files
        </Link>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
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
        {organizationId &&
          (() => {
            const selectedOrg = orgs?.find((o) => o.id === organizationId);
            return selectedOrg ? <StorageUsageBar org={selectedOrg} /> : null;
          })()}
      </div>

      {organizationId && (
        <>
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            <button
              onClick={navigateHome}
              className="hover:text-foreground flex items-center gap-1 shrink-0"
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">Root</span>
            </button>
            {ancestorsLoading && currentFolderId ? (
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 shrink-0" />
                <Skeleton className="h-4 w-24" />
              </span>
            ) : (() => {
              // On mobile show at most last 2 segments; on desktop show all
              const hidden = folderStack.slice(0, Math.max(0, folderStack.length - 2));
              const visible = folderStack.slice(Math.max(0, folderStack.length - 2));
              return (
                <>
                  {hidden.length > 0 && (
                    <span className="flex items-center gap-1 sm:hidden">
                      <ChevronRight className="size-3 shrink-0" />
                      <span className="text-muted-foreground">…</span>
                    </span>
                  )}
                  {/* Desktop: show all */}
                  {hidden.map((folder) => (
                    <span key={folder.id} className="hidden sm:flex items-center gap-1">
                      <ChevronRight className="size-3 shrink-0" />
                      <button
                        onClick={() => navigateTo(folder)}
                        className="hover:text-foreground max-w-[120px] truncate"
                      >
                        {folder.name}
                      </button>
                    </span>
                  ))}
                  {/* Always visible: last 2 segments */}
                  {visible.map((folder, i) => {
                    const globalIndex = hidden.length + i;
                    const isLast = globalIndex === folderStack.length - 1;
                    return (
                      <span key={folder.id} className="flex items-center gap-1 min-w-0">
                        <ChevronRight className="size-3 shrink-0" />
                        {isLast ? (
                          <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-none">
                            {folder.name}
                          </span>
                        ) : (
                          <button
                            onClick={() => navigateTo(folder)}
                            className="hover:text-foreground truncate max-w-[120px] sm:max-w-none"
                          >
                            {folder.name}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </>
              );
            })()}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2">
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
              title={
                isAtRoot
                  ? "Open a folder first to upload files into it"
                  : undefined
              }
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

            {/* View mode toggle */}
            <div className="ml-auto flex items-center rounded-md border">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="size-8 rounded-r-none border-r"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <LayoutList className="size-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-8 rounded-l-none"
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content area */}
          <div className="rounded-md border">
            {isAtRoot ? (
              // Root — only folders, no files
              viewMode === "list" ? (
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
                        Use <strong>New Folder</strong> to create one, then open
                        it to upload files.
                      </p>
                    </div>
                  ) : (
                    displayedSubfolders.map((folder) => (
                      <FolderItem key={folder.id} folder={folder} />
                    ))
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {rootFoldersLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="aspect-square rounded-lg"
                        />
                      ))}
                    </div>
                  ) : displayedSubfolders.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      <p>No root folders yet.</p>
                      <p className="mt-1">
                        Use <strong>New Folder</strong> to create one.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {displayedSubfolders.map((folder) => (
                        <FolderItem key={folder.id} folder={folder} />
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : isError ? (
              <QueryError onRetry={() => void refetch()} />
            ) : viewMode === "list" ? (
              <>
                <div className="divide-y">
                  {contentLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="size-5 rounded" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))
                  ) : (
                    <>
                      {data?.subfolders.map((folder) => (
                        <FolderItem key={folder.id} folder={folder} />
                      ))}
                      {data?.files.data.map((file) => (
                        <FileListItem key={file.id} file={file} />
                      ))}
                      {data?.subfolders.length === 0 &&
                        data?.files.data.length === 0 && (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            This folder is empty. Use{" "}
                            <strong>Upload File</strong> to add files.
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
            ) : (
              // Grid mode
              <div className="p-4">
                {contentLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    {data?.subfolders.length === 0 &&
                    data?.files.data.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        This folder is empty. Use <strong>Upload File</strong>{" "}
                        to add files.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {data?.subfolders.map((folder) => (
                          <FolderItem key={folder.id} folder={folder} />
                        ))}
                        {data?.files.data.map((file) =>
                          renderFileGridCard(file),
                        )}
                      </div>
                    )}
                    {data && data.files.totalPages > 1 && (
                      <div className="mt-4 border-t pt-4">
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
            )}
          </div>
        </>
      )}

      <FilePreviewDialog
        file={previewFile}
        organizationId={organizationId}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />

      <FileTagsDialog
        file={tagsFile}
        organizationId={organizationId}
        folderId={currentFolderId ?? ""}
        page={page}
        onOpenChange={(open) => {
          if (!open) setTagsFile(null);
        }}
      />

      <MoveFileDialog
        file={moveFile}
        organizationId={organizationId}
        currentFolderId={currentFolderId}
        onSuccess={() => setMoveFile(null)}
        onOpenChange={(open) => {
          if (!open) setMoveFile(null);
        }}
      />

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAtRoot
                ? "New Root Folder"
                : `New Folder in "${currentFolder?.name}"`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newFolderName.trim())
                  createFolderMutation.mutate(newFolderName.trim());
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
