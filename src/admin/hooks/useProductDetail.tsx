import { useQuery } from "@tanstack/react-query";
import { getProductDetailAction } from "@/admin/actions/get-product-detail.action";
import { productKeys } from "@/admin/queryKeys";

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: productKeys.fullDetail(id),
    queryFn: () => getProductDetailAction(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
