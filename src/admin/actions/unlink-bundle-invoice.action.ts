import { apiClient } from "@/api/apiClient";

export const unlinkBundleInvoiceAction = async (bundleId: string): Promise<void> => {
  await apiClient.patch(`/bundles/${bundleId}/unlink-invoice`);
};
