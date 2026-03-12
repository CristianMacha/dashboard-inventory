export interface WorkshopCategoryResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopCategoryCreate {
  name: string;
  description?: string;
}

export interface WorkshopCategoryUpdate {
  name?: string;
  description?: string | null;
}
