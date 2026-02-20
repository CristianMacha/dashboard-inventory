import { apiClient } from "@/api/apiClient";
import type { BundleCreate, BundleResponse } from "@/interfaces/bundle.response";

export const createBundleAction = async (
  bundle: BundleCreate,
): Promise<BundleResponse> => {
  const { data } = await apiClient.post<BundleResponse>("/bundles", bundle);
  return data;
};
