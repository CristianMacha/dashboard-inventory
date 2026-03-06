import { apiClient } from "@/api/apiClient";
import type { UserUpdate } from "@/interfaces/user.response";

export const updateUserAction = async (
  id: string,
  data: UserUpdate,
): Promise<void> => {
  await apiClient.patch(`/users/${id}`, data);
};
