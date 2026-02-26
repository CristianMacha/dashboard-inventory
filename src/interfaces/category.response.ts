export interface CategoryResponse {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  name: string;
  abbreviation?: string;
  description?: string;
}

export interface CategoryUpdate {
  name?: string;
  abbreviation?: string;
  description?: string;
  isActive?: boolean;
}
