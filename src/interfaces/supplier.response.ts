export interface SupplierResponse {
  id: string;
  name: string;
  abbreviation?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreate {
  name: string;
  abbreviation?: string;
}

export interface SupplierUpdate {
  name?: string;
  abbreviation?: string;
  isActive?: boolean;
}
