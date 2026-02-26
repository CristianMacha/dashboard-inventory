import { apiClient } from "@/api/apiClient";
import type { SupplierReturnCreate } from "@/interfaces/supplier-return.response";

export const createSupplierReturnAction = async (
  payload: SupplierReturnCreate,
): Promise<{ id: string }> => {
  const { data } = await apiClient.post<{ id: string }>(
    "/purchasing/supplier-returns",
    payload,
  );
  return data;
};
