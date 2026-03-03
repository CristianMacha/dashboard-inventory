import { apiClient } from "@/api/apiClient";
import type { BundleDetailResponse } from "@/interfaces/bundle.response";

export const getBundleByIdAction = async (id: string): Promise<BundleDetailResponse> => {
  const { data } = await apiClient.get<BundleDetailResponse>(`/bundles/${id}`);
  return data;
};
