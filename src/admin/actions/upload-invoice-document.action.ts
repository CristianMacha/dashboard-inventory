import { apiClient } from "@/api/apiClient";

export const uploadInvoiceDocumentAction = async (
  invoiceId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/purchase-invoices/${invoiceId}/document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getInvoiceDocumentUrlAction = async (
  invoiceId: string,
): Promise<{ url: string }> => {
  const { data } = await apiClient.get<{ url: string }>(
    `/purchase-invoices/${invoiceId}/document-url`,
  );
  return data;
};
