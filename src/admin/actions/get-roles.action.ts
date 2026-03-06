import { apiClient } from "@/api/apiClient";
import type { RoleResponse } from "@/interfaces/user.response";

export const getRolesAction = async (): Promise<RoleResponse[]> => {
  const { data } = await apiClient.get<RoleResponse[]>("/roles");
  return data;
};
