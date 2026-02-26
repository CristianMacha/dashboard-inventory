export interface FinishResponse {
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

export interface FinishCreate {
  name: string;
  abbreviation?: string;
  description?: string;
}

export interface FinishUpdate {
  name?: string;
  abbreviation?: string;
  description?: string;
  isActive?: boolean;
}
