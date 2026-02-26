export interface LevelResponse {
  id: string;
  name: string;
  sortOrder: number;
  description?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LevelCreate {
  name: string;
  sortOrder: number;
  description?: string;
}

export interface LevelUpdate {
  name?: string;
  sortOrder?: number;
  description?: string;
  isActive?: boolean;
}
