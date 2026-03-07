import { apiClient } from "@/api/apiClient";
import type { BundleResponse } from "@/interfaces/bundle.response";

export interface BundlesSelectParams {
  supplierId?: string;
  unlinked?: boolean;
}

export const getBundlesSelectAction = async (
  params: BundlesSelectParams = {},
): Promise<BundleResponse[]> => {
  const { data } = await apiClient.get<BundleResponse[]>("/bundles/select", { params });
  return data;
};
