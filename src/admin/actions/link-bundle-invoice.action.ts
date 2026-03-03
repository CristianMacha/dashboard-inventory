import { apiClient } from "@/api/apiClient";

export const linkBundleInvoiceAction = async (
  bundleId: string,
  purchaseInvoiceId: string,
): Promise<void> => {
  await apiClient.patch(`/bundles/${bundleId}/link-invoice`, { purchaseInvoiceId });
};
