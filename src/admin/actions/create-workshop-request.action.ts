import { apiClient } from "@/api/apiClient";
import type {
  CreateWorkshopRequestBody,
  WorkshopRequestDto,
} from "@/interfaces/workshop-request.response";

export const createWorkshopRequestAction = async (
  body: CreateWorkshopRequestBody,
): Promise<WorkshopRequestDto> => {
  const { data } = await apiClient.post<WorkshopRequestDto>("/workshop/requests", body);
  return data;
};
