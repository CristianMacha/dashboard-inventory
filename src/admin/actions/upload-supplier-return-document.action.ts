import { apiClient } from "@/api/apiClient";

export const uploadSupplierReturnDocumentAction = async (
  returnId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await apiClient.post(`/supplier-returns/${returnId}/document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getSupplierReturnDocumentUrlAction = async (
  returnId: string,
): Promise<{ url: string }> => {
  const { data } = await apiClient.get<{ url: string }>(
    `/supplier-returns/${returnId}/document-url`,
  );
  return data;
};
