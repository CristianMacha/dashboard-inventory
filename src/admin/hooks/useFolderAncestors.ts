import { useQuery } from "@tanstack/react-query";
import { fileKeys } from "@/admin/queryKeys";
import { getFolderContentsAction } from "@/admin/actions/get-folder-contents.action";
import type { FolderDto } from "@/interfaces/file.response";

/**
 * Given a leaf folderId, resolves the full ancestor chain by following parentId
 * links upward (up to 4 levels deep). Returns the path root→leaf as FolderDto[].
 * Uses GET /files/folders/{id}/contents which returns the FolderDto with parentId.
 */
export function useFolderAncestors(
  folderId: string | null,
  organizationId: string,
): { stack: FolderDto[]; isLoading: boolean } {
  const leafQ = useQuery({
    queryKey: [...fileKeys.all, "ancestor", folderId, organizationId],
    queryFn: () => getFolderContentsAction(folderId!, organizationId, 1, 1),
    enabled: !!folderId && !!organizationId,
    staleTime: 30_000,
    select: (d) => d.folder,
  });

  const leaf = leafQ.data ?? null;

  const parentQ = useQuery({
    queryKey: [...fileKeys.all, "ancestor", leaf?.parentId ?? "", organizationId],
    queryFn: () => getFolderContentsAction(leaf!.parentId!, organizationId, 1, 1),
    enabled: !!leaf?.parentId && !!organizationId,
    staleTime: 30_000,
    select: (d) => d.folder,
  });

  const parent = parentQ.data ?? null;

  const grandparentQ = useQuery({
    queryKey: [...fileKeys.all, "ancestor", parent?.parentId ?? "", organizationId],
    queryFn: () => getFolderContentsAction(parent!.parentId!, organizationId, 1, 1),
    enabled: !!parent?.parentId && !!organizationId,
    staleTime: 30_000,
    select: (d) => d.folder,
  });

  const grandparent = grandparentQ.data ?? null;

  const greatGrandparentQ = useQuery({
    queryKey: [...fileKeys.all, "ancestor", grandparent?.parentId ?? "", organizationId],
    queryFn: () => getFolderContentsAction(grandparent!.parentId!, organizationId, 1, 1),
    enabled: !!grandparent?.parentId && !!organizationId,
    staleTime: 30_000,
    select: (d) => d.folder,
  });

  const greatGrandparent = greatGrandparentQ.data ?? null;

  if (!folderId || !organizationId) {
    return { stack: [], isLoading: false };
  }

  const isLoading =
    leafQ.isLoading ||
    (!!leaf?.parentId && parentQ.isLoading) ||
    (!!parent?.parentId && grandparentQ.isLoading) ||
    (!!grandparent?.parentId && greatGrandparentQ.isLoading);

  const stack: FolderDto[] = [greatGrandparent, grandparent, parent, leaf].filter(
    (f): f is FolderDto => f !== null,
  );

  return { stack, isLoading };
}
