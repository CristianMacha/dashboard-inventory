import { apiClient } from "@/api/apiClient";
import type { PaginatedResult } from "@/interfaces/paginated-result";
import type { RoleResponse } from "@/interfaces/user.response";

export interface RolesPaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getRolesPaginatedAction = async (
  params: RolesPaginatedQueryParams = {},
): Promise<PaginatedResult<RoleResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<RoleResponse>>(
    "/roles/paginated",
    { params },
  );
  return data;
};
