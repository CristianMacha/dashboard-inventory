/**
 * Shared type for paginated API responses.
 * Use with any entity: PaginatedResult<Product>, PaginatedResult<User>, etc.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
