import { apiClient } from "@/api/apiClient";
import type { SupplierReturnDetailResponse } from "@/interfaces/supplier-return.response";

export const getSupplierReturnByIdAction = async (
  id: string,
): Promise<SupplierReturnDetailResponse> => {
  if (!id) throw new Error("Supplier return ID is required");
  const { data } = await apiClient.get<SupplierReturnDetailResponse>(
    `/purchasing/supplier-returns/${id}`,
  );
  return data;
};
