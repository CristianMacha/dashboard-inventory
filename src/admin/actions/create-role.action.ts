import { apiClient } from "@/api/apiClient";
import type { RoleResponse } from "@/interfaces/user.response";

export interface RoleCreate {
  name: string;
  permissions: string[];
}

export const createRoleAction = async (body: RoleCreate): Promise<RoleResponse> => {
  const { data } = await apiClient.post<RoleResponse>("/roles", body);
  return data;
};
