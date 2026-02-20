import { apiClient } from "@/api/apiClient";
import type { PaginatedResult } from "@/interfaces/paginated-result";
import type { ProductResponse } from "@/interfaces/product.response";
import type { ProductsQueryParams } from "@/interfaces/products-query";

export const getProductsAction = async (
  params: ProductsQueryParams = {},
): Promise<PaginatedResult<ProductResponse>> => {
  const { data } = await apiClient.get<PaginatedResult<ProductResponse>>(
    "/products",
    {
      params: {
        search: params.search ?? undefined,
        brandId: params.brandId ?? undefined,
        categoryId: params.categoryId ?? undefined,
        page: params.page ?? undefined,
        limit: params.limit ?? undefined,
      },
      // Serialize arrays as repeated params without brackets:
      // brandId=a&brandId=b  (not brandId[]=a&brandId[]=b)
      paramsSerializer: { indexes: null },
    },
  );
  return data;
};
