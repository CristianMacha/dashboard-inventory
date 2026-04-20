import { apiClient } from "@/api/apiClient";
import type { SlabReturnableResponse } from "@/interfaces/slab.response";

export const getReturnableSlabsAction = async (params: {
  purchaseInvoiceId: string;
  bundleId?: string;
}): Promise<SlabReturnableResponse[]> => {
  const { data } = await apiClient.get<SlabReturnableResponse[]>(
    "/slabs/returnable",
    { params },
  );
  return data;
};
