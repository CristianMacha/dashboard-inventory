export interface ProductUpdate {
  name?: string;
  categoryId?: string;
  levelId?: string;
  finishId?: string;
  brandId?: string | null;
  description?: string;
  isActive?: boolean;
}
