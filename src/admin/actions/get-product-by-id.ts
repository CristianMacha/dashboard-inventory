import { apiClient } from "@/api/apiClient";
import type { ProductResponse } from "@/interfaces/product.response";

export const getProductByIdAction = async (
  id: string,
): Promise<ProductResponse> => {
  if (!id) throw new Error("Product ID is required");
  if (id === "new") {
    return {
      id: "",
      name: "",
      description: "",
      stock: 0,
      category: undefined,
      brand: undefined,
      createdBy: "",
      updatedBy: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductResponse;
  }

  const { data } = await apiClient.get<ProductResponse>(`/products/${id}`);
  return data;
};
