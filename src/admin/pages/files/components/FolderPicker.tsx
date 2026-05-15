import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FolderOpen, Home, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { getRootFoldersAction } from "@/admin/actions/get-root-folders.action";
import { getFolderContentsAction } from "@/admin/actions/get-folder-contents.action";
import { searchFoldersAction } from "@/admin/actions/search-folders.action";
import { fileKeys } from "@/admin/queryKeys";
import type { FolderDto } from "@/interfaces/file.response";

interface FolderPickerProps {
  organizationId: string;
  /** Folder IDs to exclude from the list (e.g. the folder being moved) */
  excludeIds?: string[];
  /** Currently selected destination folder id (null = root) */
  selectedId: string | null | undefined;
  /** Called when user clicks a folder as destination */
  onSelect: (folderId: string | null) => void;
}

export const FolderPicker = ({
  organizationId,
  excludeIds = [],
  selectedId,
  onSelect,
}: FolderPickerProps) => {
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.trim().length > 0;
  const isAtRoot = !browseFolderId;

  const { data: rootFolders, isLoading: rootLoading } = useQuery({
    queryKey: fileKeys.rootFolders(organizationId),
    queryFn: () => getRootFoldersAction(organizationId),
    enabled: !!organizationId && isAtRoot && !isSearching,
  });

  const { data: folderContents, isLoading: contentsLoading } = useQuery({
    queryKey: [...fileKeys.all, "picker-subfolders", browseFolderId, organizationId],
    queryFn: () => getFolderContentsAction(browseFolderId!, organizationId, 1, 100),
    enabled: !!browseFolderId && !!organizationId && !isSearching,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: fileKeys.folderSearch(organizationId, searchTerm.trim()),
    queryFn: () => searchFoldersAction(organizationId, searchTerm.trim()),
    enabled: !!organizationId && isSearching,
  });

  const isLoading = rootLoading || contentsLoading || searchLoading;

  const subfolders: FolderDto[] = isSearching
    ? (searchResults ?? [])
    : isAtRoot
      ? (rootFolders ?? [])
      : (folderContents?.subfolders ?? []);

  const visibleFolders = subfolders.filter((f) => !excludeIds.includes(f.id));

  const currentFolder = breadcrumb[breadcrumb.length - 1] ?? null;

  const navigateInto = (folder: FolderDto) => {
    setBrowseFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, folder]);
  };

  const navigateHome = () => {
    setBrowseFolderId(null);
    setBreadcrumb([]);
  };

  const navigateTo = (folder: FolderDto, index: number) => {
    setBrowseFolderId(folder.id);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-sm"
          placeholder="Search folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isSearching && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Breadcrumb (hidden while searching) */}
      {!isSearching && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap min-h-[20px]">
          <button onClick={navigateHome} className="flex items-center gap-1 hover:text-foreground">
            <Home className="size-3" />
            Root
          </button>
          {breadcrumb.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              {i < breadcrumb.length - 1 ? (
                <button onClick={() => navigateTo(f, i)} className="hover:text-foreground truncate max-w-[100px]">{f.name}</button>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[100px]">{f.name}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Folder list */}
      <div className="rounded-md border min-h-[180px] max-h-[280px] overflow-y-auto">
        {/* Root as destination (only when not searching and at root level) */}
        {isAtRoot && !isSearching && (
          <button
            onClick={() => onSelect(null)}
            className={`flex w-full items-center gap-2 p-2.5 text-sm border-b transition-colors ${
              selectedId === null ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
            }`}
          >
            <Home className="size-4 shrink-0" />
            <span className="font-medium">Root</span>
          </button>
        )}

        {/* Current browsed folder as destination */}
        {currentFolder && !isSearching && (
          <button
            onClick={() => onSelect(browseFolderId)}
            className={`flex w-full items-center gap-2 p-2.5 text-sm border-b transition-colors ${
              selectedId === browseFolderId ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
            }`}
          >
            <FolderOpen className="size-4 text-amber-500 shrink-0" />
            <span className="font-medium truncate">Move here — &ldquo;{currentFolder.name}&rdquo;</span>
          </button>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-1.5 p-2.5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : visibleFolders.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {isSearching ? "No folders found." : isAtRoot ? "No root folders." : "No subfolders."}
          </div>
        ) : (
          <div className="divide-y">
            {visibleFolders.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <button
                  onClick={() => onSelect(folder.id)}
                  className={`flex flex-1 items-center gap-2 p-2.5 text-sm transition-colors truncate ${
                    selectedId === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <FolderOpen className="size-4 text-amber-500 shrink-0" />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                </button>
                {!isSearching && (
                  <button
                    onClick={() => navigateInto(folder)}
                    className="px-2.5 py-2.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Browse subfolders"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
