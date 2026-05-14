import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Download,
  Eye,
  File,
  Search,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-error";
import { CustomPagination } from "@/components/ui/custom/CustomPagination";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { getOrganizationsAction } from "@/admin/actions/get-organizations.action";
import { searchFilesAction } from "@/admin/actions/search-files.action";
import { getFileUrlAction } from "@/admin/actions/get-file-url.action";
import { fileKeys, organizationKeys } from "@/admin/queryKeys";
import { getErrorMessage } from "@/api/apiClient";
import type { FileRecordDto } from "@/interfaces/file.response";
import { FilePreviewDialog } from "./components/FilePreviewDialog";
import { FileHoverPreview } from "./components/FileHoverPreview";

const PAGE_LIMIT = 20;

const MIME_TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "PDF", value: "application/pdf" },
  { label: "Images", value: "image/" },
  { label: "Word", value: "application/msword" },
  { label: "Excel", value: "application/vnd.ms-excel" },
  { label: "CSV", value: "text/csv" },
  { label: "ZIP", value: "application/zip" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CommittedFilters {
  organizationId: string;
  name?: string;
  mimeType?: string;
  tags?: string[];
  page: number;
}

export const FileSearchPage = () => {
  const [organizationId, setOrganizationId] = useState("");

  // Draft filter state — what the user is typing
  const [nameFilter, setNameFilter] = useState("");
  const [mimeTypeFilter, setMimeTypeFilter] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Committed filters — what the last Search press sent
  const [committed, setCommitted] = useState<CommittedFilters | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRecordDto | null>(null);

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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: fileKeys.search({
      organizationId: committed?.organizationId ?? "",
      name: committed?.name,
      mimeType: committed?.mimeType,
      tags: committed?.tags,
      page: committed?.page ?? 1,
    }),
    queryFn: () =>
      searchFilesAction({
        organizationId: committed!.organizationId,
        name: committed!.name,
        mimeType: committed!.mimeType,
        tags: committed!.tags,
        page: committed!.page,
        limit: PAGE_LIMIT,
      }),
    enabled: !!committed,
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

  const addTag = (andSearch = false) => {
    const tag = tagInput.trim().toLowerCase();
    const newTags = tag && !tags.includes(tag) ? [...tags, tag] : tags;
    if (tag) setTags(newTags);
    setTagInput("");
    if (andSearch && organizationId) {
      setCommitted({
        organizationId,
        name: nameFilter || undefined,
        mimeType: mimeTypeFilter || undefined,
        tags: newTags.length > 0 ? newTags : undefined,
        page: 1,
      });
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSearch = () => {
    setCommitted({
      organizationId,
      name: nameFilter || undefined,
      mimeType: mimeTypeFilter || undefined,
      tags: tags.length > 0 ? tags : undefined,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setCommitted((prev) => prev ? { ...prev, page } : prev);
  };

  const handleClear = () => {
    setNameFilter("");
    setMimeTypeFilter("");
    setTags([]);
    setTagInput("");
    setCommitted(null);
  };

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
              <BreadcrumbLink asChild>
                <Link to="/files">Files</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Search</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="rounded-md border p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label>Organization</Label>
            {orgsLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={organizationId}
                onValueChange={(v) => {
                  setOrganizationId(v);
                  setCommitted(null);
                }}
              >
                <SelectTrigger>
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

          <div className="flex flex-col gap-1">
            <Label htmlFor="name-filter">File name</Label>
            <Input
              id="name-filter"
              placeholder="Partial name match..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && organizationId && handleSearch()}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>MIME type</Label>
            <Select
              value={mimeTypeFilter || "__all"}
              onValueChange={(v) => {
                setMimeTypeFilter(v === "__all" ? "" : v);
                if (organizationId) {
                  setCommitted({
                    organizationId,
                    name: nameFilter || undefined,
                    mimeType: v === "__all" ? undefined : v || undefined,
                    tags: tags.length > 0 ? tags : undefined,
                    page: 1,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {MIME_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || "__all"} value={opt.value || "__all"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tag-input">Tags (OR logic)</Label>
            <div className="flex gap-1">
              <Input
                id="tag-input"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(true);
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={() => addTag(false)} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={!organizationId}>
            <Search className="size-4" />
            Search
          </Button>
          {committed && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {committed && (
        <>
          {isError ? (
            <QueryError onRetry={() => void refetch()} />
          ) : (
            <div className="rounded-md border">
              <div className="divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="size-5 rounded" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                  ))
                ) : data?.data.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No files match your search criteria.
                  </div>
                ) : (
                  data?.data.map((file) => (
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
                        </p>
                        {file.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {file.tags.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs py-0">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                          onClick={() => downloadMutation.mutate(file.id)}
                          disabled={downloadMutation.isPending}
                          title="Download"
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {data && data.totalPages > 1 && (
                <div className="border-t p-4 bg-muted">
                  <CustomPagination
                    page={committed.page}
                    totalPages={data.totalPages}
                    totalCount={data.total}
                    pageSize={PAGE_LIMIT}
                    itemLabel="files"
                    onPageChange={handlePageChange}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
      <FilePreviewDialog
        file={previewFile}
        organizationId={organizationId}
        onOpenChange={(open) => { if (!open) setPreviewFile(null); }}
      />
    </div>
  );
};
