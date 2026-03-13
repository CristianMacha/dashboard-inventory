import type { ProductResponse } from "@/interfaces/product.response";
import { getProductDetailAction } from "../actions/get-product-detail.action";
import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/admin/queryKeys";

export const useProduct = (id: string) => {
  const query = useQuery<ProductResponse>({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductDetailAction(id),
    retry: false,
    enabled: Boolean(id && id !== "new"),
  });
  return { ...query };
};
