import { apiClient } from "@/api/apiClient";

export interface RoleUpdate {
  name?: string;
  permissions?: string[];
}

export const updateRoleAction = async (id: string, body: RoleUpdate): Promise<void> => {
  await apiClient.patch(`/roles/${id}`, body);
};
