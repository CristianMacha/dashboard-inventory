import { apiClient } from "@/api/apiClient";
import type { SlabCreate, SlabResponse } from "@/interfaces/slab.response";

export const createSlabAction = async (
  slab: SlabCreate,
): Promise<SlabResponse> => {
  const { data } = await apiClient.post<SlabResponse>("/slabs", slab);
  return data;
};
