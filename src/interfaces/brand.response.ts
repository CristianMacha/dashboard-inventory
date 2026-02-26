export interface BrandResponse {
  isActive: boolean;
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandCreate {
  name: string;
  description?: string;
}

export interface BrandUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}
