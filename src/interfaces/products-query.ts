/** Optional query params for GET /products */
export interface ProductsQueryParams {
  search?: string;
  brandId?: string | string[];
  categoryId?: string | string[];
  page?: number;
  limit?: number;
}
