import { apiClient } from "@/api/apiClient";
import type { RegisterMaterialMovementDto } from "@/interfaces/workshop-material.response";

export const registerMaterialMovementAction = async (
  id: string,
  dto: RegisterMaterialMovementDto,
): Promise<void> => {
  await apiClient.post(`/workshop/materials/${id}/movements`, dto);
};
