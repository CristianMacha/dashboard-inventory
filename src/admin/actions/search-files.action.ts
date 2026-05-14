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
    {
      params,
      paramsSerializer: (p) => {
        const sp = new URLSearchParams();
        for (const [key, value] of Object.entries(p)) {
          if (value === undefined || value === null) continue;
          if (Array.isArray(value)) {
            value.forEach((v) => sp.append(key, String(v)));
          } else {
            sp.append(key, String(value));
          }
        }
        return sp.toString();
      },
    },
  );
  return data;
};
