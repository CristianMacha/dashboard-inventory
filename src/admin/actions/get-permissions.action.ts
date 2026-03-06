import { apiClient } from "@/api/apiClient";
import type { PermissionResponse } from "@/interfaces/user.response";

export const getPermissionsAction = async (): Promise<PermissionResponse[]> => {
  const { data } = await apiClient.get<PermissionResponse[]>("/permissions");
  return data;
};
