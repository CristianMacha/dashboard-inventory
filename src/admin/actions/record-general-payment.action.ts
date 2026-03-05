import { apiClient } from "@/api/apiClient";
import type { GeneralPaymentCreate } from "@/interfaces/general-payment.response";

export const recordGeneralPaymentAction = async (
  payload: GeneralPaymentCreate,
): Promise<void> => {
  await apiClient.post("/general-payments", payload);
};
