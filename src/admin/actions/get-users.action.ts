import { apiClient } from "@/api/apiClient";
import type { UserResponse } from "@/interfaces/user.response";
import type { PaginatedResult } from "@/interfaces/paginated-result";

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}

export const getUsersAction = async (
  params: UsersQueryParams = {},
): Promise<PaginatedResult<UserResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<UserResponse>>("/users", { params });
  return data;
};
