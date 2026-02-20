export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductBrand {
  id: string;
  name: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  category?: ProductCategory;
  brand?: ProductBrand;
  levelId?: string;
  finishId?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
