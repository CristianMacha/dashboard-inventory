import { apiClient } from "@/api/apiClient";
import type { SlabResponse } from "@/interfaces/slab.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface SlabsQueryParams {
  page?: number;
  limit?: number;
  bundleId?: string;
  status?: string;
  search?: string;
  isRemnant?: boolean;
}

export const getSlabsAction = async (
  params: SlabsQueryParams = {},
): Promise<PaginatedResult<SlabResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<SlabResponse>>(
    "/slabs",
    { params },
  );
  return data;
};
