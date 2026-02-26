import { apiClient } from "@/api/apiClient";
import type { BundleCostResponse } from "@/interfaces/purchase-invoice.response";

export const getBundleCostAction = async (
  bundleId: string,
): Promise<BundleCostResponse> => {
  if (!bundleId) throw new Error("Bundle ID is required");
  const { data } = await apiClient.get<BundleCostResponse>(
    `/purchase-invoices/bundle-cost/${bundleId}`,
  );
  return data;
};
