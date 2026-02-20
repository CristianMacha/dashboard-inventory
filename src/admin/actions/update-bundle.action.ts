import { apiClient } from "@/api/apiClient";
import type { BundleUpdate } from "@/interfaces/bundle.response";

export const updateBundleAction = async (
  id: string,
  bundle: BundleUpdate,
): Promise<void> => {
  await apiClient.patch<void>(`/bundles/${id}`, bundle);
};
