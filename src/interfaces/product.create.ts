export interface ProductCreate {
  name: string;
  categoryId: string;
  levelId: string;
  finishId: string;
  brandId?: string;
  description?: string;
}
