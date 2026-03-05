import { apiClient } from "@/api/apiClient";
import type { RemnantSlabCreate } from "@/interfaces/slab.response";

export const createRemnantSlabAction = async (
  slabId: string,
  data: RemnantSlabCreate,
): Promise<{ id: string }> => {
  const { data: response } = await apiClient.post<{ id: string }>(
    `/slabs/${slabId}/remnant`,
    data,
  );
  return response;
};
