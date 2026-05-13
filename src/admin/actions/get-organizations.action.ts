import { apiClient } from "@/api/apiClient";
import type { OrganizationDto } from "@/interfaces/file.response";

export const getOrganizationsAction = async (): Promise<OrganizationDto[]> => {
  const { data } = await apiClient.get<OrganizationDto[]>("/organizations");
  return data;
};
