import { apiClient } from "@/api/apiClient";
import type { PaginatedFileSearchResultDto } from "@/interfaces/file.response";

export interface SearchFilesParams {
  organizationId: string;
  name?: string;
  mimeType?: string;
  folderId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export const searchFilesAction = async (
  params: SearchFilesParams,
): Promise<PaginatedFileSearchResultDto> => {
  const { data } = await apiClient.get<PaginatedFileSearchResultDto>(
    "/files/search",
    { params },
  );
  return data;
};
