import { apiClient } from "@/api/apiClient";
import type { ProcurementNeedsDto } from "@/interfaces/workshop-request.response";

export const getProcurementNeedsAction = async (): Promise<ProcurementNeedsDto> => {
  const { data } = await apiClient.get<ProcurementNeedsDto>("/workshop/requests/procurement-needs");
  return data;
};
