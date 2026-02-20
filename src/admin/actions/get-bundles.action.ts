import { apiClient } from "@/api/apiClient";
import type { BundleResponse } from "@/interfaces/bundle.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface BundlesQueryParams {
  page?: number;
  limit?: number;
}

export const getBundlesAction = async (
  params: BundlesQueryParams = {},
): Promise<PaginatedResult<BundleResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<BundleResponse>>(
    "/bundles",
    { params },
  );
  return data;
};
