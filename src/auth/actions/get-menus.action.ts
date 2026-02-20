import { apiClient } from "@/api/apiClient";
import type { MenusResponse } from "@/interfaces/menu-item";

export const getMenusAction = async (): Promise<MenusResponse> => {
  const { data } = await apiClient.get<MenusResponse>("/users/me/menu");
  return data;
};
