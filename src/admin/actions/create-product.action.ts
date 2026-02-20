import { apiClient } from "@/api/apiClient";
import type { ProductCreate } from "@/interfaces/product.create";

export const createProductAction = async (
  product: ProductCreate,
): Promise<void> => {
  await apiClient.post("/products", product);
};
