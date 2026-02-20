import type { ProductResponse } from "@/interfaces/product.response";
import { getProductByIdAction } from "../actions/get-product-by-id";
import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/admin/queryKeys";

export const useProduct = (id: string) => {
  const query = useQuery<ProductResponse>({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductByIdAction(id),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id && id !== "new"),
  });
  return { ...query };
};
